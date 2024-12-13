import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';
import { status } from 'itty-router';
import { database, UserPersonalIdentities, Users, UserSessions } from '$lib/server/database';
import { portone } from '$lib/server/external-api';
import { createAccessToken, useFirstRow } from '$lib/server/utils';
import { createRouter } from '../router';

export const identification = createRouter();

identification.get('/identification/callback', async (_, context) => {
  const uid = context.event.url.searchParams.get('imp_uid');
  const action = context.event.url.searchParams.get('action');

  if (!uid) {
    throw new Error('imp_uid is missing');
  }

  if (!context.session && action !== 'find_account') {
    throw new Error('session is missing');
  }

  const resp = await portone.getCertification(uid);
  if (resp.code !== 0) {
    throw new Error(resp.message);
  }

  if (resp.response.certified) {
    const identity = await database
      .select({ userId: UserPersonalIdentities.userId, email: Users.email, ci: UserPersonalIdentities.ci })
      .from(UserPersonalIdentities)
      .innerJoin(Users, eq(Users.id, UserPersonalIdentities.userId))
      .where(and(eq(UserPersonalIdentities.ci, resp.response.unique_key), eq(Users.state, 'ACTIVE')))
      .then(useFirstRow);

    if (action === 'find_account') {
      if (!identity) {
        await context.flash('error', '인증된 계정이 없어요');
        return status(303, { headers: { Location: '/find-account' } });
      }

      const [session] = await database
        .insert(UserSessions)
        .values({ userId: identity.userId })
        .returning({ id: UserSessions.id });

      const accessToken = await createAccessToken(session.id);
      context.event.cookies.set('glyph-at', accessToken, {
        path: '/',
        maxAge: dayjs.duration(1, 'year').asSeconds(),
      });

      return status(303, {
        headers: { Location: '/find-account/complete' },
      });
    } else if (context.session) {
      if (identity) {
        if (identity.userId !== context.session.userId) {
          context.flash('error', '이미 인증된 다른 계정이 있어요');
          return status(303, { headers: { Location: '/me/settings' } });
        } else if (identity.ci !== resp.response.unique_key) {
          context.flash('error', '이전 인증과 정보가 달라요 (정보가 변경되었을 시에는 문의해주세요)');
          return status(303, { headers: { Location: '/me/settings' } });
        }
      }

      await database
        .insert(UserPersonalIdentities)
        .values({
          userId: context.session.userId,
          kind: 'PHONE',
          name: resp.response.name,
          birthday: dayjs.kst(resp.response.birthday, 'YYYY-MM-DD'),
          phoneNumber: resp.response.phone,
          ci: resp.response.unique_key,
          expiresAt: dayjs().add(1, 'year'),
        })
        .onConflictDoUpdate({
          target: [UserPersonalIdentities.userId],
          set: {
            kind: 'PHONE',
            name: resp.response.name,
            birthday: dayjs.kst(resp.response.birthday, 'YYYY-MM-DD'),
            phoneNumber: resp.response.phone,
            expiresAt: dayjs().add(1, 'year'),
          },
        });

      await context.flash('success', '본인인증이 완료되었어요');
    }
  } else {
    await context.flash('error', '본인인증에 실패했어요');
  }

  return status(303, { headers: { Location: '/me/settings' } });
});
