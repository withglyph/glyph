import { OAuth2Client } from 'google-auth-library';
import { PRIVATE_GOOGLE_CLIENT_ID, PRIVATE_GOOGLE_CLIENT_SECRET } from '$env/static/private';
import type { ExternalUser } from './types';

const createOAuthClient = (context: { url: URL }) => {
  return new OAuth2Client({
    clientId: PRIVATE_GOOGLE_CLIENT_ID,
    clientSecret: PRIVATE_GOOGLE_CLIENT_SECRET,
    redirectUri: `${context.url.origin}/api/sso/google`,
  });
};

export const generateAuthorizationUrl = (context: { url: URL }, type: string) => {
  const client = createOAuthClient(context);
  return client.generateAuthUrl({
    scope: ['email', 'profile'],
    state: btoa(JSON.stringify({ type })),
  });
};

export const authorizeUser = async (context: { url: URL }, code: string): Promise<ExternalUser> => {
  const client = createOAuthClient(context);

  const { tokens } = await client.getToken({ code });
  if (!tokens.access_token) {
    throw new Error('Token validation failed');
  }

  const { aud } = await client.getTokenInfo(tokens.access_token);
  if (aud !== PRIVATE_GOOGLE_CLIENT_ID) {
    throw new Error('Token validation failed');
  }

  client.setCredentials(tokens);

  type R = { sub: string; email: string; name: string; picture: string };
  const response = await client.request<R>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });

  return {
    provider: 'GOOGLE',
    id: response.data.sub,
    email: response.data.email,
    name: response.data.name,
    avatarUrl: response.data.picture,
  };
};
