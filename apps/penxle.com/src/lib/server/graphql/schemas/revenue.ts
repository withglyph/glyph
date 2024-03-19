import dayjs from 'dayjs';
import { IntentionalError } from '$lib/errors';
import { settleRevenue } from '$lib/server/utils';
import { createId } from '$lib/utils';
import { PrismaEnums } from '$prisma';
import { defineSchema } from '../builder';

export const revenueSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('Revenue', {
    fields: (t) => ({
      id: t.exposeID('id'),
      amount: t.exposeInt('amount'),
      kind: t.expose('kind', { type: PrismaEnums.RevenueKind }),
      state: t.expose('state', { type: PrismaEnums.RevenueState }),
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

  builder.prismaObject('RevenueWithdrawal', {
    fields: (t) => ({
      id: t.exposeID('id'),
      kind: t.expose('kind', { type: PrismaEnums.RevenueWithdrawalKind }),
      state: t.expose('state', { type: PrismaEnums.RevenueWithdrawalState }),
      bankCode: t.exposeString('bankCode'),
      bankAccountNumber: t.exposeString('bankAccountNumber'),
      revenueAmount: t.exposeInt('revenueAmount'),
      paidAmount: t.exposeInt('paidAmount'),
      taxAmount: t.exposeInt('taxAmount'),
      taxBaseAmount: t.exposeInt('taxBaseAmount'),
      serviceFeeAmount: t.exposeInt('serviceFeeAmount'),
      withdrawalFeeAmount: t.exposeInt('withdrawalFeeAmount'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
    }),
  });

  builder.queryFields((t) => ({
    revenueWithdrawal: t.withAuth({ user: true }).prismaField({
      type: 'RevenueWithdrawal',
      args: { id: t.arg.string() },
      resolve: (query, _, { id }, { db, ...context }) => {
        return db.revenueWithdrawal.findUniqueOrThrow({
          ...query,
          where: {
            id,
            userId: context.session.userId,
          },
        });
      },
    }),
  }));

  builder.mutationFields((t) => ({
    instantSettleRevenue: t.withAuth({ user: true }).prismaField({
      type: 'User',
      resolve: async (query, _, __, { db, ...context }) => {
        await settleRevenue({ userId: context.session.userId, settlementType: 'INSTANT' });

        return db.user.findUniqueOrThrow({
          ...query,
          where: { id: context.session.userId },
        });
      },
    }),

    enableMonthlyWithdrawal: t.withAuth({ user: true }).prismaField({
      type: 'UserWithdrawalConfig',
      grantScopes: ['$user'],
      resolve: async (query, _, __, { db, ...context }) => {
        if (dayjs().kst().day() === 10) throw new IntentionalError('매월 10일에는 자동 출금 설정을 변경할 수 없어요');

        const userSettlementIdentity = await db.userSettlementIdentity.findUnique({
          where: { userId: context.session.userId },
        });

        if (!userSettlementIdentity) {
          throw new IntentionalError('먼저 창작자 인증을 진행해주세요');
        }

        return db.userWithdrawalConfig.upsert({
          ...query,
          where: {
            userId: context.session.userId,
          },
          update: {
            monthlyWithdrawalEnabled: true,
          },
          create: {
            id: createId(),
            userId: context.session.userId,
            monthlyWithdrawalEnabled: true,
          },
        });
      },
    }),

    disableMonthlyWithdrawal: t.withAuth({ user: true }).prismaField({
      type: 'UserWithdrawalConfig',
      grantScopes: ['$user'],
      resolve: async (query, _, __, { db, ...context }) => {
        if (dayjs().kst().day() === 10) throw new IntentionalError('매월 10일에는 자동 출금 설정을 변경할 수 없어요');

        const userSettlementIdentity = await db.userSettlementIdentity.findUnique({
          where: { userId: context.session.userId },
        });

        if (!userSettlementIdentity) {
          throw new IntentionalError('먼저 창작자 인증을 진행해주세요');
        }

        return db.userWithdrawalConfig.upsert({
          ...query,
          where: {
            userId: context.session.userId,
          },
          update: {
            monthlyWithdrawalEnabled: false,
          },
          create: {
            id: createId(),
            userId: context.session.userId,
            monthlyWithdrawalEnabled: false,
          },
        });
      },
    }),
  }));
});
