import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import numeral from 'numeral';
import { match } from 'ts-pattern';
import { PaymentMethod, PointPurchaseState, PointTransactionCause, StoreKind } from '$lib/enums';
import { NotFoundError } from '$lib/errors';
import { database, inArray, PointPurchases, PointTransactions, PostPurchases, Users } from '$lib/server/database';
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
    pointAmount: t.int(),
  }),
});

const FinalizeInAppPurchasePointInput = builder.inputType('FinalizeInAppPurchasePointInput', {
  fields: (t) => ({
    store: t.field({ type: StoreKind }),
    transactionId: t.string(),
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
      const paymentKey = `PX${input.pointAmount}${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ')(8)}`;
      const paymentAmount = Math.floor(input.pointAmount * 1.1);
      const expiresAt = dayjs().add(1, 'hour');

      const pgData = await match(input.paymentMethod)
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
        .with('IN_APP_PURCHASE', () => ({}))
        .exhaustive();

      const users = await database
        .select({ email: Users.email })
        .from(Users)
        .where(eq(Users.id, context.session.userId));

      if (users.length === 0) {
        throw new NotFoundError();
      }

      const paymentData = {
        merchant_uid: paymentKey,
        name: `글리프 ${input.pointAmount} P`,
        amount: paymentAmount,
        buyer_email: users[0].email,

        notice_url: `${context.event.url.origin}/api/payment/webhook`,
        m_redirect_url: `${context.event.url.origin}/api/payment/callback`,

        ...pgData,
      };

      await portone.registerPaymentAmount({ paymentKey, paymentAmount: paymentData.amount });

      const [pointPurchase] = await database
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

      return pointPurchase.id;
    },
  }),

  inAppPurchasePoint: t.withAuth({ user: true }).field({
    type: PointPurchase,
    args: { input: t.arg({ type: InAppPurchasePointInput }) },
    resolve: async (_, { input }, context) => {
      const paymentKey = crypto.randomUUID();
      const expiresAt = dayjs().add(1, 'hour');

      const [pointPurchase] = await database
        .insert(PointPurchases)
        .values({
          userId: context.session.userId,
          pointAmount: input.pointAmount,
          paymentAmount: input.pointAmount * 1.2,
          paymentMethod: 'IN_APP_PURCHASE',
          paymentKey,
          paymentData: {},
          state: 'PENDING',
          expiresAt,
        })
        .returning({ id: PointPurchases.id });

      return pointPurchase.id;
    },
  }),

  finalizeInAppPurchasePoint: t.withAuth({ user: true }).field({
    type: PointPurchase,
    nullable: true,
    args: { input: t.arg({ type: FinalizeInAppPurchasePointInput }) },
    resolve: async (_, { input }) => {
      const store = match(input.store)
        .with('APP_STORE', () => apple)
        .with('PLAY_STORE', () => google)
        .exhaustive();

      const purchase = await store.getInAppPurchase(input.transactionId);
      console.log(purchase);

      return null;
    },
  }),
}));
