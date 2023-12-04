import { PaymentMethod, PointPurchaseState } from '@prisma/client';
import dayjs from 'dayjs';
import { customAlphabet } from 'nanoid';
import { match } from 'ts-pattern';
import { registerPaymentAmount } from '$lib/server/external-api/portone';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('PointPurchase', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    pointAmount: t.exposeInt('pointAmount'),
    paymentAmount: t.exposeInt('paymentAmount'),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethod }),
    paymentData: t.expose('paymentData', { type: 'JSON' }),
    paymentResult: t.expose('paymentResult', { type: 'JSON', nullable: true }),
    state: t.expose('state', { type: PointPurchaseState }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime' }),
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

/**
 * * Queries
 */

builder.queryFields((t) => ({
  pointPurchase: t.withAuth({ user: true }).prismaField({
    type: 'PointPurchase',
    args: { paymentKey: t.arg.string() },
    resolve: (query, _, args, { db, ...context }) => {
      return db.pointPurchase.findUniqueOrThrow({
        ...query,
        where: {
          paymentKey: args.paymentKey,
          userId: context.session.userId,
        },
      });
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  purchasePoint: t.withAuth({ user: true }).prismaField({
    type: 'PointPurchase',
    args: { input: t.arg({ type: PurchasePointInput }) },
    resolve: async (query, __, { input }, { db, ...context }) => {
      const user = await db.user.findUniqueOrThrow({
        select: { email: true },
        where: { id: context.session.userId },
      });

      const paymentKey = `PX${input.pointAmount / 1000}${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ')(12)}`;
      const paymentAmount = input.pointAmount;

      const pgData = match(input.paymentMethod)
        .with('CREDIT_CARD', () => ({ pg: 'tosspayments', pay_method: 'card' }))
        .with('BANK_ACCOUNT', () => ({ pg: 'tosspayments', pay_method: 'trans' }))
        .with('VIRTUAL_BANK_ACCOUNT', () => ({ pg: 'tosspayments', pay_method: 'vbank' }))
        .with('PHONE_BILL', () => ({ pg: 'tosspayments', pay_method: 'phone' }))
        .with('GIFTCARD_CULTURELAND', () => ({ pg: 'tosspayments', pay_method: 'cultureland' }))
        .with('GIFTCARD_SMARTCULTURE', () => ({ pg: 'tosspayments', pay_method: 'smartculture' }))
        .with('GIFTCARD_BOOKNLIFE', () => ({ pg: 'tosspayments', pay_method: 'booknlife' }))
        .with('PAYPAL', () => ({ pg: 'paypal_v2', pay_method: 'paypal' }))
        .exhaustive();

      const paymentData = {
        ...pgData,

        merchant_uid: paymentKey,
        name: `펜슬 ${input.pointAmount} P`,
        amount: paymentAmount,
        buyer_email: user.email,

        notice_url: `${context.url.origin}/api/payment/webhook`,
        m_redirect_url: `${context.url.origin}/api/payment/callback`,
      };

      await registerPaymentAmount({ paymentKey, paymentAmount: input.pointAmount });

      return await db.pointPurchase.create({
        ...query,
        data: {
          id: createId(),
          userId: context.session.userId,
          pointAmount: input.pointAmount,
          paymentAmount,
          paymentMethod: input.paymentMethod,
          paymentKey,
          paymentData,
          state: 'PENDING',
          expiresAt: dayjs().add(1, 'hour').toDate(),
        },
      });
    },
  }),
}));
