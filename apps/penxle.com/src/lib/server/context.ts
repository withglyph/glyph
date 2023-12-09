import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { redis } from './cache';
import { prismaClient } from './database';
import { decodeAccessToken } from './utils/access-token';
import type { RequestEvent } from '@sveltejs/kit';
import type { MaybePromise } from '$lib/types';
import type { InteractiveTransactionClient } from './database';

type InternalContext = {
  $commitHooks: (() => MaybePromise<void>)[];
};

type DefaultContext = {
  db: InteractiveTransactionClient;
  deviceId: string;
  flash: (type: 'success' | 'error', message: string) => Promise<void>;
  onCommit: (fn: () => MaybePromise<void>) => void;

  $commit: () => Promise<void>;
  $rollback: () => Promise<void>;
};

export type UserContext = {
  session: {
    id: string;
    userId: string;
  };
};

export type Context = RequestEvent & App.Locals & DefaultContext & Partial<UserContext>;

export const createContext = async (context: RequestEvent): Promise<Context> => {
  const db = await prismaClient.$begin({ isolation: 'ReadCommitted' });
  let deviceId = context.cookies.get('penxle-did');
  if (!deviceId) {
    deviceId = nanoid(32);
    context.cookies.set('penxle-did', deviceId, {
      path: '/',
      maxAge: dayjs.duration(1, 'year').asSeconds(),
    });
  }

  const ctx: Context & InternalContext = {
    ...context,
    ...context.locals,
    db,
    deviceId,
    $commitHooks: [],
    onCommit: (fn: () => MaybePromise<void>) => ctx.$commitHooks.push(fn),
    flash: async (type: 'success' | 'error', message: string) => {
      await redis.setex(`flash:${deviceId}`, 30, JSON.stringify({ type, message }));
    },
    $commit: async () => {
      await db.$commit();
      await Promise.all(ctx.$commitHooks.map((fn) => fn()));
    },
    $rollback: async () => {
      await db.$rollback();
    },
  };

  const accessToken = context.cookies.get('penxle-at');
  if (accessToken) {
    let sessionId: string | undefined;

    try {
      sessionId = await decodeAccessToken(accessToken);
    } catch {
      // noop
    }

    if (sessionId) {
      const session = await db.userSession.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        ctx.session = {
          id: sessionId,
          userId: session.userId,
        };
      }
    }
  }

  return ctx;
};
