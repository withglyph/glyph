import got from 'got';
import qs from 'query-string';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import type { ExternalUser } from './types';

export const generateAuthorizationUrl = (event: RequestEvent, type: string) => {
  return qs.stringifyUrl({
    url: 'https://nid.naver.com/oauth2.0/authorize',
    query: {
      response_type: 'code',
      client_id: env.PRIVATE_NAVER_CLIENT_ID,
      redirect_uri: `${event.url.origin}/api/sso/naver`,
      state: Buffer.from(JSON.stringify({ type })).toString('base64'),
    },
  });
};

export const authorizeUser = async (mode: 'code' | 'token', codeOrToken: string): Promise<ExternalUser> => {
  if (mode === 'code') {
    const tokens = await got(
      qs.stringifyUrl({
        url: 'https://nid.naver.com/oauth2.0/token',
        query: {
          grant_type: 'authorization_code',
          client_id: env.PRIVATE_NAVER_CLIENT_ID,
          client_secret: env.PRIVATE_NAVER_CLIENT_SECRET,
          code: codeOrToken,
        },
      }),
    ).json<{ access_token: string }>();

    if (!tokens.access_token) {
      throw new Error('Token validation failed');
    }

    codeOrToken = tokens.access_token;
  }

  type R = { response: { id: string; email: string; nickname: string; profile_image: string } };
  const me = await got('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${codeOrToken}` },
  }).json<R>();

  if (!me.response.id || !me.response.email) {
    throw new Error('User validation failed');
  }

  return {
    provider: 'NAVER',
    id: me.response.id,
    email: me.response.email,
    name: me.response.nickname,
    avatarUrl: me.response.profile_image,
  };
};
