import { status } from 'itty-router';
import { SignJWT } from 'jose';
import qs from 'query-string';
import { env } from '$env/dynamic/private';
import { createRouter } from '../router';

export const frill = createRouter();

const key = new TextEncoder().encode(env.PRIVATE_FRILL_SSO_KEY);

frill.get('/frill', async (_, { db, ...context }) => {
  if (!context.session) {
    return status(303, { headers: { Location: '/login' } });
  }

  const user = await db.user.findUniqueOrThrow({
    include: { profile: true },
    where: { id: context.session.userId },
  });

  const ssoToken = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.profile.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key);

  return status(303, {
    headers: {
      Location: qs.stringifyUrl({
        url: context.url.searchParams.get('redirect') || 'https://penxle.frill.co',
        query: { ssoToken },
      }),
    },
  });
});
