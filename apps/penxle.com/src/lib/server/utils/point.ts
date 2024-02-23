import { createId } from '$lib/utils';
import type { PrismaEnums } from '$prisma';
import type { InteractiveTransactionClient } from '../database';

type GetUserPointParams = {
  db: InteractiveTransactionClient;
  userId: string;
  kind?: PrismaEnums.PointKind;
};
export const getUserPoint = async ({ db, userId, kind }: GetUserPointParams) => {
  const agg = await db.pointBalance.aggregate({
    _sum: { leftover: true },
    where: {
      userId,
      leftover: { gt: 0 },
      expiresAt: { gt: new Date() },
      kind,
    },
  });

  return agg._sum.leftover ?? 0;
};

type DeductPointParams = {
  db: InteractiveTransactionClient;
  userId: string;
  amount: number;
  cause: PrismaEnums.PointTransactionCause;
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
      leftover: { gt: 0 },
      expiresAt: { gt: new Date() },
    },
    orderBy: [{ expiresAt: 'asc' }, { kind: 'asc' }],
  });

  let targetAmount = amount;
  const changes: { id: string; leftover: number }[] = [];

  for (const pointBalance of pointBalances) {
    if (targetAmount === 0) {
      break;
    }

    const leftover = Math.max(pointBalance.leftover - targetAmount, 0);
    targetAmount -= pointBalance.leftover - leftover;

    changes.push({
      id: pointBalance.id,
      leftover,
    });
  }

  if (targetAmount !== 0) {
    throw new Error('insufficient point');
  }

  for (const { id, leftover } of changes) {
    await db.pointBalance.update({
      where: { id },
      data: { leftover },
    });
  }

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
