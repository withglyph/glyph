import dayjs from 'dayjs';
import { status } from 'itty-router';
import { portone } from '$lib/server/external-api';
import { createId } from '$lib/utils';
import { createRouter } from '../router';

export const identification = createRouter();

identification.get('/identification/callback', async (_, { db, ...context }) => {
  const uid = context.url.searchParams.get('imp_uid');
  if (!uid) {
    throw new Error('imp_uid is missing');
  }

  if (!context.session) {
    throw new Error('session is missing');
  }

  const resp = await portone.getCertification(uid);
  if (resp.code !== 0) {
    throw new Error(resp.message);
  }

  if (resp.response.certified) {
    await db.userPersonalIdentity.create({
      data: {
        id: createId(),
        userId: context.session.userId,
        name: resp.response.name,
        birthday: dayjs.kst(resp.response.birthday, 'YYYY-MM-DD').utc().toDate(),
        phoneNumber: resp.response.phone,
        ci: resp.response.unique_key,
      },
    });

    await context.flash('success', '본인인증이 완료되었어요');
  } else {
    await context.flash('error', '본인인증에 실패했어요');
  }

  return status(303, { headers: { Location: '/me/settings' } });
});
