import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { prismaClient } from './database';
import { decodeAccessToken } from './utils/access-token';
import type { RequestEvent } from '@sveltejs/kit';
import type { InteractiveTransactionClient } from './database';

type DefaultContext = {
  db: InteractiveTransactionClient;
  deviceId: string;
};

export type AuthContext = {
  session: {
    id: string;
    userId: string;
  };
};

export type Context = RequestEvent &
  App.Locals &
  DefaultContext &
  Partial<AuthContext>;

export const createContext = async (
  context: RequestEvent,
): Promise<Context> => {
  const db = await prismaClient.$begin({ isolation: 'RepeatableRead' });
  let deviceId = context.cookies.get('penxle-did');
  if (!deviceId) {
    deviceId = nanoid(32);
    context.cookies.set('penxle-did', deviceId, {
      path: '/',
      maxAge: dayjs.duration(1, 'year').asSeconds(),
    });
  }

  const ctx: Context = {
    ...context,
    ...context.locals,
    db,
    deviceId,
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
      const session = await db.session.findUnique({
        select: { userId: true },
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
