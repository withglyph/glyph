import { createId } from '$lib/utils';
import type { PrismaEnums } from '$prisma';
import type { InteractiveTransactionClient } from '../prisma';

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
