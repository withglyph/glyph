import dayjs from 'dayjs';
import { createId } from '$lib/utils';
import { track } from '../analytics';
import { prismaClient } from '../database';
import { decodeAccessToken } from '../utils/access-token';
import type { TransactionClient } from '../database';
import type { RequestEvent } from '@sveltejs/kit';
import type { YogaInitialContext } from 'graphql-yoga';

type DefaultContext = {
  db: TransactionClient;
  deviceId: string;
  track: (eventName: string, properties?: Record<string, unknown>) => void;
};

export type AuthContext = {
  session: {
    id: number;
    userId: number;
    profileId: number;
  };
};

type ExtendedContext = App.Locals & DefaultContext & Partial<AuthContext>;
type InitialContext = YogaInitialContext & RequestEvent;
export type Context = InitialContext & ExtendedContext;

export const extendContext = async (
  context: InitialContext
): Promise<ExtendedContext> => {
  const db = await prismaClient.$begin({ isolation: 'RepeatableRead' });
  let deviceId = context.cookies.get('penxle-did');
  if (!deviceId) {
    deviceId = createId();
    context.cookies.set('penxle-did', deviceId, {
      path: '/',
      expires: dayjs().add(5, 'years').toDate(),
    });
  }

  const ctx: ExtendedContext = {
    ...context.locals,
    db,
    deviceId,
    track: (eventName, properties) => {
      track(context, eventName, {
        $device_id: deviceId,
        ...properties,
      });
    },
  };

  const accessToken = context.cookies.get('penxle-at');
  if (accessToken) {
    let sessionId: number | undefined;

    try {
      sessionId = await decodeAccessToken(accessToken);
    } catch {
      // noop
    }

    if (sessionId) {
      const session = await db.session.findUnique({
        select: { userId: true, profileId: true },
        where: { id: sessionId },
      });

      if (session) {
        ctx.session = {
          id: sessionId,
          userId: session.userId,
          profileId: session.profileId,
        };

        ctx.track = (eventName, properties) => {
          track(context, eventName, {
            $device_id: deviceId,
            $user_id: session.userId,
            ...properties,
          });
        };
      }
    }
  }

  return ctx;
};
