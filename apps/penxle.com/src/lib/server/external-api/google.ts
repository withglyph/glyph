import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private';
import type { ExternalUser } from './types';

const createOAuthClient = (context: { url: URL }) => {
  return new OAuth2Client({
    clientId: env.PRIVATE_GOOGLE_CLIENT_ID,
    clientSecret: env.PRIVATE_GOOGLE_CLIENT_SECRET,
    redirectUri: `${context.url.origin}/api/sso/google`,
  });
};

export const generateAuthorizationUrl = (context: { url: URL }, type: string) => {
  const client = createOAuthClient(context);
  return client.generateAuthUrl({
    scope: ['email', 'profile'],
    state: Buffer.from(JSON.stringify({ type })).toString('base64'),
  });
};

export const authorizeUser = async (context: { url: URL }, code: string): Promise<ExternalUser> => {
  const client = createOAuthClient(context);

  const { tokens } = await client.getToken({ code });
  if (!tokens.access_token) {
    throw new Error('Token validation failed');
  }

  const { aud } = await client.getTokenInfo(tokens.access_token);
  if (aud !== env.PRIVATE_GOOGLE_CLIENT_ID) {
    throw new Error('Token validation failed');
  }

  client.setCredentials(tokens);

  type R = { sub: string; email: string; name: string; picture: string };
  const userinfo = await client.request<R>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });

  return {
    provider: 'GOOGLE',
    id: userinfo.data.sub,
    email: userinfo.data.email,
    name: userinfo.data.name,
    avatarUrl: userinfo.data.picture,
  };
};
