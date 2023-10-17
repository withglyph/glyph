import dayjs from 'dayjs';
import { status } from 'itty-router';
import { nanoid } from 'nanoid';
import qs from 'query-string';
import { sendEmail } from '$lib/server/email';
import { UserEmailUpdated } from '$lib/server/email/templates';
import { createAccessToken } from '$lib/server/utils';
import { createId } from '$lib/utils';
import { createRouter } from '../router';

export const email = createRouter();

email.get('/email', async (_, { db, ...context }) => {
  const token = context.url.searchParams.get('token');
  if (!token) {
    throw new Error('token is required');
  }

  const userEmailVerification = await db.userEmailVerification.delete({
    include: { user: { include: { profile: { select: { name: true } } } } },
    where: {
      token,
      expiresAt: { gte: new Date() },
    },
  });

  if (userEmailVerification.kind === 'USER_LOGIN') {
    const user = await db.user.findFirst({
      where: {
        email: userEmailVerification.email,
        state: 'ACTIVE',
      },
    });

    if (user) {
      const session = await db.userSession.create({
        select: { id: true },
        data: { id: createId(), userId: user.id },
      });

      const accessToken = await createAccessToken(session.id);
      context.cookies.set('penxle-at', accessToken, {
        path: '/',
        maxAge: dayjs.duration(1, 'year').asSeconds(),
      });

      return status(303, { headers: { Location: '/' } });
    } else {
      const token = nanoid();

      await db.provisionedUser.create({
        data: {
          id: createId(),
          email: userEmailVerification.email,
          token,
        },
      });

      return status(303, {
        headers: {
          Location: qs.stringifyUrl({
            url: '/signup',
            query: { token },
          }),
        },
      });
    }
  } else if (userEmailVerification.kind === 'USER_EMAIL_UPDATE' && userEmailVerification.user) {
    const isEmailUsed = await db.user.exists({
      where: {
        email: userEmailVerification.email,
        state: 'ACTIVE',
      },
    });

    if (isEmailUsed) {
      throw new Error('email is already used');
    }

    await db.user.update({
      where: { id: userEmailVerification.user.id },
      data: {
        email: userEmailVerification.email,
        state: 'ACTIVE',
      },
    });

    await sendEmail({
      subject: 'PENXLE 이메일이 변경되었어요.',
      recipient: userEmailVerification.user.email,
      template: UserEmailUpdated,
      props: {
        name: userEmailVerification.user.profile.name,
        email: userEmailVerification.email,
      },
    });

    return status(303, { headers: { Location: '/me/settings' } });
  }
});
