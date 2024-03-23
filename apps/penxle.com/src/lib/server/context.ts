import DataLoader from 'dataloader';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { redis } from './cache';
import { prismaClient } from './database';
import { db as db2 } from './database/index';
import { decodeAccessToken } from './utils/access-token';
import type { RequestEvent } from '@sveltejs/kit';
import type { MaybePromise } from '$lib/types';
import type { PrismaEnums } from '$prisma';
import type { InteractiveTransactionClient } from './database';

type InternalContext = {
  $commitHooks: (() => MaybePromise<void>)[];
  $dataLoaders: Record<string, DataLoader<unknown, unknown>>;
};

type DefaultContext = {
  event: RequestEvent;

  deviceId: string;

  flash: (type: 'success' | 'error', message: string) => Promise<void>;

  db: InteractiveTransactionClient;
  $commit: () => Promise<void>;
  $rollback: () => Promise<void>;
  onCommit: (fn: () => MaybePromise<void>) => void;

  dataLoader: <idType, dataType>(
    name: string,
    loader: DataLoader.BatchLoadFn<idType, dataType>,
  ) => DataLoader<idType, dataType>;
};

export type UserContext = {
  session: {
    id: string;
    userId: string;
    role: PrismaEnums.UserRole;
  };
};

export type Context = DefaultContext & Partial<UserContext>;

export const createContext = async (event: RequestEvent): Promise<Context> => {
  const a = await db2.selectFrom('user_sessions').selectAll().executeTakeFirstOrThrow();
  console.log('!!!!!!!!!!!!!', a.createdAt);

  const db = await prismaClient.$begin({ isolation: 'ReadCommitted' });
  let deviceId = event.cookies.get('penxle-did');
  if (!deviceId) {
    deviceId = nanoid(32);
    event.cookies.set('penxle-did', deviceId, {
      path: '/',
      maxAge: dayjs.duration(1, 'year').asSeconds(),
    });
  }

  const ctx: Context & InternalContext = {
    event,
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
    $dataLoaders: {},
    dataLoader: <idType, dataType>(name: string, loader: DataLoader.BatchLoadFn<idType, dataType>) => {
      if (!ctx.$dataLoaders[name]) {
        ctx.$dataLoaders[name] = new DataLoader(loader);
      }
      return ctx.$dataLoaders[name] as DataLoader<idType, dataType>;
    },
  };

  const accessToken = event.cookies.get('penxle-at');
  if (accessToken) {
    let sessionId: string | undefined;

    try {
      sessionId = await decodeAccessToken(accessToken);
    } catch {
      // noop
    }

    if (sessionId) {
      const session = await db.userSession.findUnique({
        include: { user: true },
        where: {
          id: sessionId,
          user: {
            state: 'ACTIVE',
          },
        },
      });

      if (session) {
        ctx.session = {
          id: sessionId,
          userId: session.userId,
          role: session.user.role,
        };
      }
    }
  }

  return ctx;
};
