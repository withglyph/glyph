import { PaymentMethod, PointPurchaseState, PointTransactionCause } from '@prisma/client';
import dayjs from 'dayjs';
import { customAlphabet } from 'nanoid';
import numeral from 'numeral';
import { match } from 'ts-pattern';
import { exim, portone } from '$lib/server/external-api';
import { createId } from '$lib/utils';
import { defineSchema } from '../builder';

export const pointSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('PointPurchase', {
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

  builder.prismaObject('PointTransaction', {
    fields: (t) => ({
      id: t.exposeID('id'),
      amount: t.exposeInt('amount'),
      cause: t.expose('cause', { type: PointTransactionCause }),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),

      post: t.prismaField({
        type: 'Post',
        nullable: true,
        resolve: async (query, { targetId }, __, { db }) => {
          if (!targetId) return null;

          const postPurchase = await db.postPurchase.findUnique({
            select: { post: query },
            where: { id: targetId },
          });
          return postPurchase?.post;
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
          where: { id: context.session.userId },
        });

        const paymentKey = `PX${input.pointAmount}${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ')(8)}`;
        const paymentAmount = input.pointAmount * 1.1;
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
          .exhaustive();

        const paymentData = {
          merchant_uid: paymentKey,
          name: `펜슬 ${input.pointAmount} P`,
          amount: paymentAmount,
          buyer_email: user.email,

          notice_url: `${context.event.url.origin}/api/payment/webhook`,
          m_redirect_url: `${context.event.url.origin}/api/payment/callback`,

          ...pgData,
        };

        await portone.registerPaymentAmount({ paymentKey, paymentAmount: paymentData.amount });

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
            expiresAt: expiresAt.toDate(),
          },
        });
      },
    }),
  }));
});
