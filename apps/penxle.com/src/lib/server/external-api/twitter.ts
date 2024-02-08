import qs from 'query-string';
import * as R from 'radash';
import { TwitterApi } from 'twitter-api-v2';
import { env } from '$env/dynamic/private';
import { redis } from '$lib/server/cache';
import type { RequestEvent } from '@sveltejs/kit';
import type { ExternalUser } from './types';

export type TwitterUser = {
  penxleSpaceSlugs: string[];
};

const penxleSpaceRegex = /^penxle\.com\/([\d_a-z][\d._a-z]*[\d_a-z])/;

export const generateAuthorizationUrl = async (event: RequestEvent, type: string) => {
  const state = Buffer.from(JSON.stringify({ type })).toString('base64');

  const client = new TwitterApi({
    appKey: env.PRIVATE_TWITTER_CONSUMER_KEY,
    appSecret: env.PRIVATE_TWITTER_CONSUMER_SECRET,
  });

  const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(
    qs.stringifyUrl({
      url: `${event.url.origin}/api/sso/twitter`,
      query: { state },
    }),
  );

  await redis.setex(`sso:twitter:oauth-token:${oauth_token}`, 86_400, oauth_token_secret);

  return url;
};

export const authorizeUser = async (token: string, verifier: string): Promise<ExternalUser & TwitterUser> => {
  const secret = await redis.getdel(`sso:twitter:oauth-token:${token}`);
  if (!secret) {
    throw new Error('cannot find oauth_token_secret');
  }

  const client = new TwitterApi({
    appKey: env.PRIVATE_TWITTER_CONSUMER_KEY,
    appSecret: env.PRIVATE_TWITTER_CONSUMER_SECRET,
    accessToken: token,
    accessSecret: secret,
  });

  const { client: userClient } = await client.login(verifier);
  const user = await userClient.v1.verifyCredentials({ include_email: true });

  const slugs = R.sift(
    [
      ...(user.entities?.url?.urls.map((url) => url.display_url) ?? []),
      ...(user.entities?.description?.urls.map((url) => url.display_url) ?? []),
    ].map((url) => url.match(penxleSpaceRegex)?.[1]),
  );

  return {
    provider: 'TWITTER',
    id: user.id_str,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    email: user.email!,
    name: user.name,
    avatarUrl: user.profile_image_url_https,
    penxleSpaceSlugs: slugs,
  };
};
