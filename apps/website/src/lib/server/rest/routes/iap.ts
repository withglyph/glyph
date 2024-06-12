import dayjs from 'dayjs';
import { eq, sql } from 'drizzle-orm';
import { status } from 'itty-router';
import { fromBase64 } from 'js-base64';
import { database, PointBalances, PointPurchases, PointTransactions } from '$lib/server/database';
import { apple, google } from '$lib/server/external-api';
import { createRouter } from '../router';

export const iap = createRouter();

iap.post('/iap/google', async (_, context) => {
  const body = await context.event.request.json();
  const data = JSON.parse(fromBase64(body.message.data));

  if (!data.oneTimeProductNotification) {
    return status(200);
  }

  const resp = await google.getInAppPurchase({
    productId: data.oneTimeProductNotification.sku,
    purchaseToken: data.oneTimeProductNotification.purchaseToken,
  });

  if (resp.consumptionState === 0) {
    await google.consumeInAppPurchase({
      productId: data.oneTimeProductNotification.sku,
      purchaseToken: data.oneTimeProductNotification.purchaseToken,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await purchasePoint(resp.obfuscatedExternalAccountId!, resp);

  return status(200);
});

iap.post('/iap/apple', async (_, context) => {
  const body = await context.event.request.json();
  const payload = await apple.verifier.verifyAndDecodeNotification(body.signedPayload);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tx = await apple.verifier.verifyAndDecodeTransaction(payload.data!.signedTransactionInfo!);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await purchasePoint(tx.appAccountToken!, tx);

  return status(200);
});

const purchasePoint = async (uuid: string, payload: unknown) => {
  await database.transaction(async (tx) => {
    const purchases = await tx
      .select({
        id: PointPurchases.id,
        state: PointPurchases.state,
        userId: PointPurchases.userId,
        paymentKey: PointPurchases.paymentKey,
        pointAmount: PointPurchases.pointAmount,
      })
      .from(PointPurchases)
      .where(sql`${PointPurchases.paymentData}->>'uuid' = ${uuid}`)
      .for('update');

    if (purchases.length === 0) {
      return;
    }

    const [purchase] = purchases;

    if (purchase.state === 'PENDING') {
      await tx.insert(PointBalances).values({
        userId: purchase.userId,
        purchaseId: purchase.id,
        kind: 'PAID',
        initial: purchase.pointAmount,
        leftover: purchase.pointAmount,
        expiresAt: dayjs().add(5, 'years'),
      });

      await tx.insert(PointTransactions).values({
        userId: purchase.userId,
        amount: purchase.pointAmount,
        cause: 'PURCHASE',
        targetId: purchase.id,
      });

      await tx
        .update(PointPurchases)
        .set({ state: 'COMPLETED', paymentResult: payload, completedAt: dayjs() })
        .where(eq(PointPurchases.id, purchase.id));
    }
  });
};
