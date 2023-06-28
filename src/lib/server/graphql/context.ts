import { track } from '../analytics';
import { prismaClient } from '../database';
import { decodeAccessToken } from '../utils/access-token';
import type { TransactionClient } from '../prisma/transaction';
import type { RequestEvent } from '@sveltejs/kit';
import type { YogaInitialContext } from 'graphql-yoga';

type DefaultContext = {
  db: TransactionClient;
  track: (eventName: string, properties?: Record<string, unknown>) => void;
};

export type AuthContext = {
  session: {
    id: string;
    userId: string;
    profileId: string;
  };
};

type ExtendedContext = App.Locals & DefaultContext & Partial<AuthContext>;
type InitialContext = YogaInitialContext & RequestEvent;
export type Context = InitialContext & ExtendedContext;

export const extendContext = async (
  context: InitialContext
): Promise<ExtendedContext> => {
  const ctx: ExtendedContext = {
    ...context.locals,
    db: await prismaClient.$begin(),
    track: (eventName, properties) => {
      track(context, eventName, { ...properties });
    },
  };

  const accessToken = context.cookies.get('penxle-at');
  if (accessToken) {
    try {
      const payload = await decodeAccessToken(accessToken);
      const sessionId = payload.jti;

      if (sessionId) {
        const session = await prismaClient.session.findUnique({
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
              $user_id: session.userId,
              ...properties,
            });
          };
        }
      }
    } catch {
      // TODO: 에러 어떻게 처리할지 고민해보기
    }
  }

  return ctx;
};
