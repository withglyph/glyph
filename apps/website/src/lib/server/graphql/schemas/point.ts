import { stack } from '@withglyph/lib/environment';
import dayjs from 'dayjs';
import { and, eq, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import numeral from 'numeral';
import { match } from 'ts-pattern';
import { PaymentMethod, PointPurchaseState, PointTransactionCause, StoreKind } from '$lib/enums';
import { NotFoundError } from '$lib/errors';
import {
  database,
  inArray,
  PointBalances,
  PointPurchases,
  PointTransactions,
  PostPurchases,
  Users,
} from '$lib/server/database';
import { apple, exim, google, portone } from '$lib/server/external-api';
import { builder } from '../builder';
import { createInterfaceRef, createObjectRef } from '../utils';
import { Post } from './post';
import { UserEventEnrollment } from './user';

/**
 * * Types
 */

export const PointPurchase = createObjectRef('PointPurchase', PointPurchases);
PointPurchase.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    pointAmount: t.exposeInt('pointAmount'),
    paymentAmount: t.exposeInt('paymentAmount'),
    paymentKey: t.exposeString('paymentKey'),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethod }),
    paymentData: t.expose('paymentData', { type: 'JSON' }),
    paymentResult: t.expose('paymentResult', { type: 'JSON', nullable: true }),
    state: t.expose('state', { type: PointPurchaseState }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime' }),
  }),
});

export const IPointTransaction = createInterfaceRef('IPointTransaction', PointTransactions);
IPointTransaction.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    amount: t.exposeInt('amount'),
    cause: t.expose('cause', { type: PointTransactionCause }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),

  resolveType: (pointTransaction) =>
    match(pointTransaction.cause)
      .with('PURCHASE', () => 'PurchasePointTransaction')
      .with('UNLOCK_CONTENT', () => 'UnlockContentPointTransaction')
      .with('EVENT_REWARD', () => 'EventRewardPointTransaction')
      .otherwise(() => 'PointTransaction'),
});

export const PointTransaction = createObjectRef('PointTransaction', PointTransactions);
PointTransaction.implement({
  interfaces: [IPointTransaction],
});

export const PurchasePointTransaction = createObjectRef('PurchasePointTransaction', PointTransactions);
PurchasePointTransaction.implement({
  interfaces: [IPointTransaction],
  fields: (t) => ({
    purchase: t.field({
      type: PointPurchase,
      resolve: async (pointTransaction) => {
        if (!pointTransaction.targetId) {
          throw new Error('no targetId');
        }

        return pointTransaction.targetId;
      },
    }),
  }),
});

export const UnlockContentPointTransaction = createObjectRef('UnlockContentPointTransaction', PointTransactions);
UnlockContentPointTransaction.implement({
  interfaces: [IPointTransaction],
  fields: (t) => ({
    post: t.field({
      type: Post,
      resolve: async (pointTransaction, _, context) => {
        if (!pointTransaction.targetId) {
          throw new Error('no targetId');
        }

        const loader = context.loader({
          name: 'PointTransaction.post',
          load: async (postPurchaseIds: string[]) => {
            return await database
              .select({ id: PostPurchases.id, postId: PostPurchases.postId })
              .from(PostPurchases)
              .where(inArray(PostPurchases.id, postPurchaseIds));
          },
          key: (postPurchase) => postPurchase?.id,
        });

        const postPurchase = await loader.load(pointTransaction.targetId);

        return postPurchase.postId;
      },
    }),
  }),
});

export const EventRewardPointTransaction = createObjectRef('EventRewardPointTransaction', PointTransactions);
EventRewardPointTransaction.implement({
  interfaces: [IPointTransaction],
  fields: (t) => ({
    eventEnrollment: t.field({
      type: UserEventEnrollment,
      resolve: async (pointTransaction) => {
        if (!pointTransaction.targetId) {
          throw new Error('no targetId');
        }

        return pointTransaction.targetId;
      },
    }),
  }),
});

/**
 * * Inputs
 */

const PurchasePointInput = builder.inputType('PurchasePointInput', {
  fields: (t) => ({
    paymentMethod: t.field({ type: PaymentMethod }),
    pointAmount: t.int(),
    pointAgreement: t.boolean(),
  }),
});

const InAppPurchasePointInput = builder.inputType('InAppPurchasePointInput', {
  fields: (t) => ({
    store: t.field({ type: StoreKind }),
    productId: t.string(),
    data: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  pointPurchase: t.withAuth({ user: true }).field({
    type: PointPurchase,
    args: { paymentKey: t.arg.string() },
    resolve: async (_, args, context) => {
      const pointPurchases = await database
        .select({ id: PointPurchases.id })
        .from(PointPurchases)
        .where(and(eq(PointPurchases.paymentKey, args.paymentKey), eq(PointPurchases.userId, context.session.userId)));

      if (pointPurchases.length === 0) {
        throw new NotFoundError();
      }

      return pointPurchases[0].id;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  purchasePoint: t.withAuth({ user: true }).field({
    type: PointPurchase,
    args: { input: t.arg({ type: PurchasePointInput }) },
    resolve: async (_, { input }, context) => {
      if (
        (stack === 'prod' || stack === 'staging') &&
        input.paymentMethod === 'DUMMY' &&
        context.session.role !== 'ADMIN'
      ) {
        throw new Error('Invalid payment method');
      }

      const paymentKey = `PX${input.pointAmount}${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ')(8)}`;
      const paymentAmount =
        input.paymentMethod === 'DUMMY'
          ? 0
          : Math.floor(input.pointAmount * (input.paymentMethod === 'IN_APP_PURCHASE' ? 1.2 : 1.1));
      const expiresAt = dayjs().add(1, 'hour');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let paymentData: any = await match(input.paymentMethod)
        .with('CREDIT_CARD', () => ({ pg: 'tosspayments', pay_method: 'card' }))
        .with('BANK_ACCOUNT', () => ({ pg: 'tosspayments', pay_method: 'trans' }))
        .with('VIRTUAL_BANK_ACCOUNT', () => ({
          pg: 'tosspayments',
          pay_method: 'vbank',
          vbank_due: expiresAt.kst().format('YYYY-MM-DD HH:mm:ss'),
        }))
        .with('PHONE_BILL', () => ({ pg: 'tosspayments', pay_method: 'phone' }))
        .with('GIFTCARD_CULTURELAND', () => ({ pg: 'tosspayments', pay_method: 'cultureland' }))
        .with('GIFTCARD_SMARTCULTURE', () => ({ pg: 'tosspayments', pay_method: 'smartculture' }))
        .with('GIFTCARD_BOOKNLIFE', () => ({ pg: 'tosspayments', pay_method: 'booknlife' }))
        .with('PAYPAL', async () => ({
          pg: 'paypal_v2',
          pay_method: 'paypal',
          amount: numeral(paymentAmount / (await exim.getUSDExchangeRate())).format('0.00'),
        }))
        .with('IN_APP_PURCHASE', () => ({ uuid: crypto.randomUUID() }))
        .with('DUMMY', () => ({}))
        .exhaustive();

      const users = await database
        .select({ email: Users.email })
        .from(Users)
        .where(eq(Users.id, context.session.userId));

      if (users.length === 0) {
        throw new NotFoundError();
      }

      if (input.paymentMethod !== 'IN_APP_PURCHASE' && input.paymentMethod !== 'DUMMY') {
        paymentData = {
          merchant_uid: paymentKey,
          name: `글리프 ${input.pointAmount} P`,
          amount: paymentAmount,
          buyer_email: users[0].email,

          notice_url: `${context.event.url.origin}/api/payment/webhook`,
          m_redirect_url: `${context.event.url.origin}/api/payment/callback`,

          ...paymentData,
        };

        await portone.registerPaymentAmount({ paymentKey, paymentAmount: paymentData.amount });
      }

      return await database.transaction(async (tx) => {
        const [purchase] = await tx
          .insert(PointPurchases)
          .values({
            userId: context.session.userId,
            pointAmount: input.pointAmount,
            paymentAmount,
            paymentMethod: input.paymentMethod,
            paymentKey,
            paymentData,
            state: 'PENDING',
            expiresAt,
          })
          .returning({ id: PointPurchases.id });

        if (input.paymentMethod === 'DUMMY') {
          await tx.insert(PointBalances).values({
            userId: context.session.userId,
            purchaseId: purchase.id,
            kind: 'PAID',
            initial: input.pointAmount,
            leftover: input.pointAmount,
            expiresAt: dayjs().add(5, 'years'),
          });

          await tx.insert(PointTransactions).values({
            userId: context.session.userId,
            amount: input.pointAmount,
            cause: 'PURCHASE',
            targetId: purchase.id,
          });

          await tx
            .update(PointPurchases)
            .set({ state: 'COMPLETED', paymentResult: {}, completedAt: dayjs() })
            .where(eq(PointPurchases.id, purchase.id));
        }

        return purchase.id;
      });
    },
  }),

  inAppPurchasePoint: t.withAuth({ user: true }).field({
    type: PointPurchase,
    args: { input: t.arg({ type: InAppPurchasePointInput }) },
    resolve: async (_, { input }) => {
      let payload;
      let uuid;

      if (input.store === 'APP_STORE') {
        payload = await apple.getInAppPurchase({ receiptData: input.data });
        uuid = payload.appAccountToken;
      } else if (input.store === 'PLAY_STORE') {
        payload = await google.getInAppPurchase({ productId: input.productId, purchaseToken: input.data });
        uuid = payload.obfuscatedExternalAccountId;
      } else {
        throw new Error('Invalid store');
      }

      return await database.transaction(async (tx) => {
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
          throw new Error('purchase not found');
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

        return purchase.id;
      });
    },
  }),
}));
