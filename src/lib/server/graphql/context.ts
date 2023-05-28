import { db } from '../database';
import { decodeAccessToken } from '../utils/access-token';
import type { RequestEvent } from '@sveltejs/kit';
import type { YogaInitialContext } from 'graphql-yoga';

// eslint-disable-next-line @typescript-eslint/ban-types
type DefaultContext = {};

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
  };

  const accessToken = context.cookies.get('penxle-at');
  if (accessToken) {
    try {
      const payload = await decodeAccessToken(accessToken);
      const sessionId = payload.jti;

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
        }
      }
    } catch {
      // TODO: 에러 어떻게 처리할지 고민해보기
    }
  }

  return ctx;
};
