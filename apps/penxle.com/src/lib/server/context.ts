import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { redis } from './cache';
import { database, UserRole, Users, UserSessions } from './database';
import { decodeAccessToken } from './utils/access-token';
import type { RequestEvent } from '@sveltejs/kit';
import type { DbEnum } from './database';

type DefaultContext = {
  event: RequestEvent;

  deviceId: string;

  flash: (type: 'success' | 'error', message: string) => Promise<void>;
};

export type UserContext = {
  session: {
    id: string;
    userId: string;
    profileId: string;
    role: DbEnum<typeof UserRole>;
  };
};

export type Context = DefaultContext & Partial<UserContext>;

export const createContext = async (event: RequestEvent): Promise<Context> => {
  let deviceId = event.cookies.get('penxle-did');
  if (!deviceId) {
    deviceId = nanoid(32);
    event.cookies.set('penxle-did', deviceId, {
      path: '/',
      maxAge: dayjs.duration(1, 'year').asSeconds(),
    });
  }

  const ctx: Context = {
    event,
    deviceId,
    flash: async (type: 'success' | 'error', message: string) => {
      await redis.setex(`flash:${deviceId}`, 30, JSON.stringify({ type, message }));
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
      const sessions = await database
        .select({ id: UserSessions.id, userId: Users.id, profileId: Users.profileId, role: Users.role })
        .from(UserSessions)
        .innerJoin(Users, eq(Users.id, UserSessions.userId))
        .where(and(eq(UserSessions.id, sessionId), eq(Users.state, 'ACTIVE')));

      if (sessions.length > 0) {
        ctx.session = sessions[0];
      }
    }
  }

  return ctx;
};
