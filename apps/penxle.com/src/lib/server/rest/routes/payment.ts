import dayjs from 'dayjs';
import { status } from 'itty-router';
import qs from 'query-string';
import { portone } from '$lib/server/external-api';
import { createId } from '$lib/utils';
import { createRouter } from '../router';

export const payment = createRouter();

payment.get('/payment/callback', async (_, { db, ...context }) => {
  const uid = context.event.url.searchParams.get('imp_uid');
  if (!uid) {
    throw new Error('imp_uid is missing');
  }

  const resp = await portone.getPayment(uid);
  if (resp.code !== 0) {
    throw new Error(resp.message);
  }

  let purchase = await db.pointPurchase.findUniqueOrThrow({
    where: { paymentKey: resp.response.merchant_uid },
  });

  await db.$lock(`USER_POINT_${purchase.userId}`);

  purchase = await db.pointPurchase.findUniqueOrThrow({
    where: { paymentKey: resp.response.merchant_uid },
  });

  await db.pointPurchase.update({
    where: { id: purchase.id },
    data: { paymentResult: resp.response },
  });

  if (resp.response.status === 'paid' && purchase.state === 'PENDING') {
    await db.pointBalance.create({
      data: {
        id: createId(),
        userId: purchase.userId,
        purchaseId: purchase.id,
        kind: 'PAID',
        initial: purchase.pointAmount,
        leftover: purchase.pointAmount,
        expiresAt: dayjs().add(5, 'years').toDate(),
      },
    });

    await db.pointTransaction.create({
      data: {
        id: createId(),
        userId: purchase.userId,
        amount: purchase.pointAmount,
        cause: 'PURCHASE',
        targetId: purchase.id,
      },
    });

    await db.pointPurchase.update({
      where: { id: purchase.id },
      data: {
        state: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  } else if (resp.response.status === 'failed') {
    await db.pointPurchase.update({
      where: { id: purchase.id },
      data: {
        state: 'FAILED',
      },
    });

    await context.flash('error', resp.response.fail_reason);
    return status(303, { headers: { Location: '/point/purchase' } });
  }

  return status(303, {
    headers: {
      Location: qs.stringifyUrl({
        url: '/point/purchase/complete',
        query: { paymentKey: purchase.paymentKey },
      }),
    },
  });
});

payment.post('/payment/webhook', async (_, { db, ...context }) => {
  const payload = await context.event.request.json();

  const resp = await portone.getPayment(payload.imp_uid);
  if (resp.code !== 0) {
    throw new Error(resp.message);
  }

  let purchase = await db.pointPurchase.findUniqueOrThrow({
    where: { paymentKey: resp.response.merchant_uid },
  });

  await db.$lock(`USER_POINT_${purchase.userId}`);

  purchase = await db.pointPurchase.findUniqueOrThrow({
    where: { paymentKey: resp.response.merchant_uid },
  });

  await db.pointPurchase.update({
    where: { id: purchase.id },
    data: { paymentResult: resp.response },
  });

  if (resp.response.status === 'paid' && purchase.state === 'PENDING') {
    await db.pointBalance.create({
      data: {
        id: createId(),
        userId: purchase.userId,
        purchaseId: purchase.id,
        kind: 'PAID',
        initial: purchase.pointAmount,
        leftover: purchase.pointAmount,
        expiresAt: dayjs().add(5, 'years').toDate(),
      },
    });

    await db.pointTransaction.create({
      data: {
        id: createId(),
        userId: purchase.userId,
        amount: purchase.pointAmount,
        cause: 'PURCHASE',
        targetId: purchase.id,
      },
    });

    await db.pointPurchase.update({
      where: { id: purchase.id },
      data: {
        state: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  return status(200);
});
