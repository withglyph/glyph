import dayjs from 'dayjs';
import { status } from 'itty-router';
import { nanoid } from 'nanoid';
import qs from 'query-string';
import { google, naver, twitter } from '$lib/server/external-api';
import { createAccessToken } from '$lib/server/utils';
import { createId } from '$lib/utils';
import { createRouter } from '../router';
import type { Context } from '$lib/server/context';
import type { ExternalUser } from '$lib/server/external-api/types';

export const sso = createRouter();
type State = { type: string };

sso.get('/sso/google', async (_, context) => {
  const code = context.event.url.searchParams.get('code');
  if (!code) {
    throw new Error('code is required');
  }

  const externalUser = await google.authorizeUser(context.event, code);
  return await handle(context, externalUser);
});

sso.get('/sso/naver', async (_, context) => {
  const code = context.event.url.searchParams.get('code');
  if (!code) {
    throw new Error('code is required');
  }

  const externalUser = await naver.authorizeUser(code);
  return await handle(context, externalUser);
});

sso.get('/sso/twitter', async (_, context) => {
  const token = context.event.url.searchParams.get('oauth_token');
  const verifier = context.event.url.searchParams.get('oauth_verifier');
  if (!token || !verifier) {
    throw new Error('oauth_token and oauth_verifier is required');
  }

  const externalUser = await twitter.authorizeUser(token, verifier);
  return await handle(context, externalUser);
});

const handle = async ({ db, ...context }: Context, externalUser: ExternalUser) => {
  const _state = context.event.url.searchParams.get('state');
  if (!_state) {
    throw new Error('state is required');
  }

  const state = JSON.parse(Buffer.from(_state, 'base64').toString()) as State;

  const sso = await db.userSingleSignOn.findUnique({
    where: {
      provider_principal: {
        provider: externalUser.provider,
        principal: externalUser.id,
      },
    },
  });

  // 하나의 핸들러로 여러가지 기능을 처리하기에 케이스 분리가 필요함.

  if (state.type === 'LINK') {
    // 케이스 1: 계정 연동중인 경우

    if (!context.session) {
      // 케이스 1 (fail): 현재 사이트에 로그인이 되어 있지 않은 상태
      // -> 에러
      // 일반적인 케이스에서는 세션이 만료되었을때?

      return status(303, { headers: { Location: '/login' } });
    }

    if (sso) {
      // 케이스 1-1: 콜백이 날아온 계정이 이미 사이트의 "누군가에게" 연동이 되어 있는 경우

      if (sso.userId === context.session.userId) {
        // 케이스 1-1-1: 그 "누군가"가 현재 로그인된 본인인 경우
        // -> 이미 로그인도 되어 있고 연동도 되어 있으니 아무것도 하지 않음

        return status(303, { headers: { Location: '/me/settings' } });
      } else {
        // 케이스 1-1-2: 그 "누군가"가 현재 로그인된 본인이 아닌 경우
        // -> 현재 로그인된 세션과 연동된 계정이 다르므로 에러

        return status(303, {
          headers: {
            Location: qs.stringifyUrl({
              url: '/me/settings',
              query: { message: 'sso_already_linked_by_other' },
            }),
          },
        });
      }
    } else {
      // 케이스 1-2: 콜백이 날아온 계정이 아직 사이트에 연동이 안 된 계정인 경우
      // -> 현재 로그인한 계정에 콜백이 날아온 계정을 연동함

      await db.userSingleSignOn.create({
        data: {
          id: createId(),
          userId: context.session.userId,
          provider: externalUser.provider,
          principal: externalUser.id,
          email: externalUser.email,
        },
      });

      return status(303, { headers: { Location: '/me/settings' } });
    }
  } else if (state.type === 'LOGIN') {
    // 케이스 2: 계정 로그인 혹은 가입중인 경우

    if (sso) {
      // 케이스 2-1: 콜백이 날아온 계정이 이미 사이트의 "누군가에게" 연동이 되어 있는 경우
      // -> 그 "누군가"로 로그인함

      const session = await db.userSession.create({
        data: { id: createId(), userId: sso.userId },
      });

      const accessToken = await createAccessToken(session.id);
      context.event.cookies.set('penxle-at', accessToken, {
        path: '/',
        maxAge: dayjs.duration(1, 'year').asSeconds(),
      });

      return status(303, { headers: { Location: '/' } });
    } else {
      // 케이스 2-2: 콜백이 날아온 계정이 아직 사이트에 연동이 안 된 계정인 경우

      const user = await db.user.findFirst({
        where: {
          email: externalUser.email.toLowerCase(),
          state: 'ACTIVE',
        },
      });

      if (user) {
        // 케이스 2-2-1: 콜백이 날아온 계정의 이메일과 같은 이메일의 계정이 이미 사이트에 있으나, 연동이 안 된 경우
        // -> 자동으로 기존 계정에 연동 & 로그인해줌

        await db.userSingleSignOn.create({
          data: {
            id: createId(),
            userId: user.id,
            provider: externalUser.provider,
            principal: externalUser.id,
            email: externalUser.email,
          },
        });

        const session = await db.userSession.create({
          data: { id: createId(), userId: user.id },
        });

        const accessToken = await createAccessToken(session.id);
        context.event.cookies.set('penxle-at', accessToken, {
          path: '/',
          maxAge: dayjs.duration(1, 'year').asSeconds(),
        });

        return status(303, { headers: { Location: '/' } });
      } else {
        // 케이스 2-2-2: 콜백이 날아온 계정의 이메일이 연동되지 않았고, 같은 이메일의 계정도 사이트에 없는 경우
        // -> 가입 페이지로 보냄

        const token = nanoid();

        await db.provisionedUser.create({
          data: {
            id: createId(),
            email: externalUser.email,
            token,
            name: externalUser.name,
            avatarUrl: externalUser.avatarUrl,
            provider: externalUser.provider,
            principal: externalUser.id,
          },
        });

        return status(303, {
          headers: {
            Location: qs.stringifyUrl({
              url: '/signup',
              query: { token },
            }),
          },
        });
      }
    }
  }

  // 여기까지 오면 안 됨
  throw new Error('should not reach here');
};
