import dayjs from 'dayjs';
import { match } from 'ts-pattern';
import { IntentionalError } from '$lib/errors';
import * as coocon from '$lib/server/external-api/coocon';
import { logToSlack } from '$lib/server/utils';
import { createId } from '$lib/utils';
import { prismaClient } from '../database';
import type { PrismaEnums } from '$prisma';
import type { InteractiveTransactionClient } from '../database';

type GetUserRevenueParams = {
  db: InteractiveTransactionClient;
  userId: string;
};
export const getUserRevenue = async ({ db, userId }: GetUserRevenueParams) => {
  const agg = await db.revenue.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      state: { not: 'PAID' },
    },
  });

  return agg._sum.amount ?? 0;
};

type CreateRevenueParams = {
  db: InteractiveTransactionClient;
  userId: string;
  targetId: string;
  amount: number;
  kind: PrismaEnums.RevenueKind;
};
export const createRevenue = async ({ db, userId, targetId, amount, kind }: CreateRevenueParams) => {
  if (amount <= 0) {
    throw new Error('amount must be positive');
  }

  await db.revenue.create({
    data: {
      id: createId(),
      userId,
      targetId,
      amount,
      kind,
      state: 'PENDING',
    },
  });
};

type SettleRevenueParams = {
  userId: string;
  settlementType: 'REGULAR' | 'INSTANT';
};
export const settleRevenue = async ({ userId, settlementType }: SettleRevenueParams) => {
  const db = await prismaClient.$begin({ isolation: 'ReadCommitted' });
  await db.$lock(`USER_REVENUE_${userId}`);

  const dateCondition = dayjs().subtract(7, 'day').toDate();
  const revenues = await db.revenue.findMany({
    where: {
      userId,
      state: { not: 'PAID' },
      withdrawalId: null,
      createdAt: { lt: dateCondition },
    },
  });

  const totalRevenueAmount = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalSettleAmount = match(settlementType)
    .with('REGULAR', () => (totalRevenueAmount >= 30_000 ? Math.floor(totalRevenueAmount * 0.85) : 0))
    .with('INSTANT', () => (totalRevenueAmount >= 1000 ? Math.floor(totalRevenueAmount * 0.85) - 500 : 0))
    .exhaustive();

  if (totalSettleAmount <= 0) {
    throw new IntentionalError('출금할 수 있는 금액이 없어요');
  }

  const settlementIdentity = await db.userSettlementIdentity.findUnique({
    where: { userId },
  });

  if (!settlementIdentity) {
    throw new IntentionalError('먼저 창작자 인증을 진행해 주세요');
  }

  const settlement = await db.revenueWithdrawal.create({
    data: {
      id: createId(),
      userId,
      bankCode: settlementIdentity.bankCode,
      bankAccountNumber: settlementIdentity.bankAccountNumber,
      paidAmount: totalSettleAmount,
      taxAmount: Math.floor(totalSettleAmount * 0.033),
      revenues: { connect: revenues.map((revenue) => ({ id: revenue.id })) },
    },
  });

  await db.$commit();

  let txId: string | undefined;

  try {
    txId = await coocon.transferOut({
      bankCode: settlement.bankCode,
      accountNumber: settlement.bankAccountNumber,
      amount: settlement.paidAmount,
      memo: settlement.id,
    });
  } catch (err) {
    logToSlack('settle', {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '수익출금 실패',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `UserID: ${userId}\nSettlementID: ${settlement.id}\nError: ${(err as Error).message}`,
          },
        },
      ],
    });

    await prismaClient.revenueWithdrawal.update({
      where: { id: settlement.id },
      data: {
        state: 'FAILED',
        revenues: { set: [] },
      },
    });

    throw new IntentionalError('수익출금에 실패했어요');
  }

  try {
    const dbAfter = await prismaClient.$begin({ isolation: 'ReadCommitted' });
    await dbAfter.$lock(`USER_REVENUE_${userId}`);

    const txSuccess = await coocon.verifyTransferOut({ txId });
    if (!txSuccess) {
      throw new IntentionalError('이체 검증에 실패했어요. 고객센터에 문의해 주세요');
    }

    await dbAfter.revenueWithdrawal.update({
      where: { id: settlement.id },
      data: {
        state: 'SUCCESS',
        txId,
        revenues: {
          updateMany: {
            where: {},
            data: { state: 'PAID' },
          },
        },
      },
    });
  } catch (err) {
    logToSlack('settle', {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '수익출금 이후 동작 실패!!',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `UserID: ${userId}\nSettlementID: ${settlement.id}\nTxID: ${txId}\nAmount: ${settlement.paidAmount}\nError: ${(err as Error).message}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `이체가 이미 진행되었기 때문에 수동으로 처리해 주세요!!`,
          },
        },
      ],
    });

    throw err;
  }

  logToSlack('settle', {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '수익 출금 알림',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `UserID: ${userId}\nSettlementID: ${settlement.id}\nTxID: ${txId}\nAccount:${settlement.bankCode} ${settlement.bankAccountNumber}\nAmount: ${settlement.paidAmount}`,
        },
      },
    ],
  });

  return settlement;
};
