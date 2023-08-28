import { google } from 'googleapis';
import {
  PRIVATE_GOOGLE_CLIENT_ID,
  PRIVATE_GOOGLE_CLIENT_SECRET,
} from '$env/static/private';
import type { ExternalUser } from './types';

const createOAuthClient = (context: { url: URL }) => {
  return new google.auth.OAuth2({
    clientId: PRIVATE_GOOGLE_CLIENT_ID,
    clientSecret: PRIVATE_GOOGLE_CLIENT_SECRET,
    redirectUri: `${context.url.origin}/api/auth/google`,
  });
};

export const generateAuthorizationUrl = (context: { url: URL }) => {
  const client = createOAuthClient(context);
  return client.generateAuthUrl({
    scope: ['email', 'profile'],
  });
};

export const authorizeUser = async (
  context: { url: URL },
  code: string,
): Promise<ExternalUser> => {
  const client = createOAuthClient(context);
  const { tokens } = await client.getToken({ code });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { aud } = await client.getTokenInfo(tokens.access_token!);
  if (aud !== PRIVATE_GOOGLE_CLIENT_ID) {
    throw new Error('Token validation failed');
  }

  client.setCredentials(tokens);

  type R = { sub: string; email: string; name: string; picture: string };
  const response = await client.request<R>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });

  return {
    id: response.data.sub,
    email: response.data.email,
    name: response.data.name,
    avatarUrl: response.data.picture,
  };
};
