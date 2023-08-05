import { error, status } from 'itty-router';
import { authorizeGoogleUser } from '$lib/server/external/google';
import { createRouter } from '../router';

export const auth = createRouter();

auth.get('/auth/google', async (_, { db, ...context }) => {
  const code = context.url.searchParams.get('code');
  if (!code) {
    return error(400);
  }

  const googleUser = await authorizeGoogleUser(context, code);

  const sso = await db.userSSO.findUnique({
    select: { user: { select: { id: true } } },
    where: {
      provider_providerUserId: {
        provider: 'GOOGLE',
        providerUserId: googleUser.id,
      },
    },
  });

  if (context.session) {
    if (sso) {
      if (sso.user.id !== context.session.userId) {
        return error(400);
      }
    } else {
      return status(301, { headers: { Location: '/' } });
    }
  }
});
