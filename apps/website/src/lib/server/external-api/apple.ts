import { AppStoreServerAPIClient, Environment } from '@apple/app-store-server-library';
import { production } from '@withglyph/lib/environment';
import appleSignIn from 'apple-signin-auth';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import type { ExternalUser } from './types';

const client = new AppStoreServerAPIClient(
  env.PRIVATE_APPLE_IAP_PRIVATE_KEY,
  env.PRIVATE_APPLE_IAP_KEY_ID,
  env.PRIVATE_APPLE_IAP_ISSUER_ID,
  'com.withglyph.app',
  production ? Environment.PRODUCTION : Environment.SANDBOX,
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateAuthorizationUrl = (event: RequestEvent, type: string) => {
  throw new Error('Not implemented');
};

export const authorizeUser = async (event: RequestEvent, code: string): Promise<ExternalUser> => {
  const clientSecret = appleSignIn.getClientSecret({
    clientID: env.PRIVATE_APPLE_CLIENT_ID,
    teamID: env.PRIVATE_APPLE_TEAM_ID,
    keyIdentifier: env.PRIVATE_APPLE_KEY_ID,
    privateKey: env.PRIVATE_APPLE_PRIVATE_KEY,
  });

  const tokens = await appleSignIn.getAuthorizationToken(code, {
    clientID: env.PRIVATE_APPLE_CLIENT_ID,
    clientSecret,
    redirectUri: `${event.url.origin}/api/sso/apple`,
  });

  if (!tokens.id_token) {
    throw new Error('Token validation failed');
  }

  const idToken = await appleSignIn.verifyIdToken(tokens.id_token, {
    audience: env.PRIVATE_APPLE_CLIENT_ID,
  });

  return {
    provider: 'APPLE',
    id: idToken.sub,
    email: idToken.email,
    name: null,
    avatarUrl: null,
  };
};

export const getInAppPurchase = async (transactionId: string) => {
  const resp = await client.getTransactionInfo(transactionId);

  return resp.signedTransactionInfo;
};
