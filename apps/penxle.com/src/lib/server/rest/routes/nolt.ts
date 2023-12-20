import { status } from 'itty-router';
import { SignJWT } from 'jose';
import qs from 'query-string';
import { env } from '$env/dynamic/private';
import { createRouter } from '../router';

export const nolt = createRouter();

const key = new TextEncoder().encode(env.PRIVATE_NOLT_SSO_SECRET_KEY);

nolt.get('/nolt', async (_, { db, ...context }) => {
  if (!context.session) {
    return status(303, { headers: { Location: '/login' } });
  }

  const user = await db.user.findUniqueOrThrow({
    include: { profile: { include: { avatar: true } } },
    where: { id: context.session.userId },
  });

  const ssoToken = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.profile.name,
    imageUrl: `https://pnxl.net/${user.profile.avatar.path}`,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key);

  return status(303, {
    headers: {
      Location: qs.stringifyUrl({
        url: `https://penxle.nolt.io/sso/${ssoToken}`,
        query: { returnUrl: context.event.url.searchParams.get('returnUrl') },
      }),
    },
  });
});
