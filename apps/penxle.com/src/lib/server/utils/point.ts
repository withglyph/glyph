import { createId } from '$lib/utils';
import type { PointTransactionCause } from '@prisma/client';
import type { InteractiveTransactionClient } from '../database';

type GetUserPointParams = {
  db: InteractiveTransactionClient;
  userId: string;
};
export const getUserPoint = async ({ db, userId }: GetUserPointParams) => {
  const agg = await db.pointBalance.aggregate({
    _sum: { leftover: true },
    where: { userId },
  });

  return agg._sum.leftover ?? 0;
};

type DeductPointParams = {
  db: InteractiveTransactionClient;
  userId: string;
  amount: number;
  cause: PointTransactionCause;
  targetId?: string;
};
export const deductUserPoint = async ({ db, userId, amount, targetId, cause }: DeductPointParams) => {
  if (amount <= 0) {
    throw new Error('amount must be positive');
  }

  await db.$lock(`USER_POINT_${userId}`);

  const pointBalances = await db.pointBalance.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: [{ expiresAt: 'asc' }, { kind: 'asc' }],
  });

  let targetAmount = amount;
  const pointQueries: Promise<unknown>[] = [];

  for (const pointBalance of pointBalances) {
    if (targetAmount === 0) {
      break;
    }

    const leftover = Math.max(pointBalance.leftover - targetAmount, 0);
    targetAmount -= pointBalance.leftover - leftover;

    pointQueries.push(
      leftover === 0
        ? db.pointBalance.delete({
            where: { id: pointBalance.id },
          })
        : db.pointBalance.update({
            where: { id: pointBalance.id },
            data: { leftover },
          }),
    );
  }

  if (targetAmount !== 0) {
    throw new Error('insufficient point');
  }

  await Promise.all(pointQueries);

  await db.pointTransaction.create({
    data: {
      id: createId(),
      userId,
      cause,
      amount: -amount,
      targetId,
    },
  });
};
