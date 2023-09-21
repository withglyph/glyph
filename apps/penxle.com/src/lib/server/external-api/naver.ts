import {
  PRIVATE_NAVER_CLIENT_ID,
  PRIVATE_NAVER_CLIENT_SECRET,
} from '$env/static/private';
import type { ExternalUser } from './types';

export const generateAuthorizationUrl = (
  context: { url: URL },
  type: string,
) => {
  return (
    `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${PRIVATE_NAVER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(context.url.origin)}/api/sso/naver&` +
    `state=${encodeURIComponent(btoa(JSON.stringify({ type })))}`
  );
};

export const authorizeUser = async (code: string): Promise<ExternalUser> => {
  const tokens = await fetch(
    'https://nid.naver.com/oauth2.0/token?' +
      `grant_type=authorization_code&client_id=${PRIVATE_NAVER_CLIENT_ID}&` +
      `client_secret=${PRIVATE_NAVER_CLIENT_SECRET}&code=${code}`,
  ).then((res) => res.json());

  type R = {
    id: string;
    email: string;
    nickname: string;
    profile_image: string;
  };
  const response = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  })
    .then((res) => res.json())
    .then((res) => res.response as R);

  return {
    provider: 'NAVER',
    id: response.id,
    email: response.email,
    name: response.nickname,
    avatarUrl: response.profile_image,
  };
};
