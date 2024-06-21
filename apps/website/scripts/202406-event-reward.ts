import dayjs from 'dayjs';
import { and, eq, isNull } from 'drizzle-orm';
import { database, inArray, PointBalances, PointTransactions, UserEventEnrollments } from '$lib/server/database';

let eventEnrollmentCount = 0;
do {
  await database.transaction(async (tx) => {
    const eventEnrollments = await tx
      .select({ id: UserEventEnrollments.id, userId: UserEventEnrollments.userId })
      .from(UserEventEnrollments)
      .where(
        and(
          eq(UserEventEnrollments.eventCode, 'weekly_challenge_24061'),
          eq(UserEventEnrollments.eligible, true),
          isNull(UserEventEnrollments.rewardedAt),
        ),
      )
      .limit(100)
      .for('update');

    eventEnrollmentCount = eventEnrollments.length;
    if (eventEnrollmentCount === 0) {
      return;
    }

    // 2주차부터는 전주차에서 리워드 받았는지 체크할것

    await tx
      .update(UserEventEnrollments)
      .set({ rewardedAt: dayjs() })
      .where(
        inArray(
          UserEventEnrollments.id,
          eventEnrollments.map((enrollment) => enrollment.id),
        ),
      );

    await tx.insert(PointBalances).values(
      eventEnrollments.map((enrollment) => ({
        userId: enrollment.userId,
        kind: 'FREE' as const,
        initial: 2000,
        leftover: 2000,
        expiresAt: dayjs().add(1, 'years'),
      })),
    );

    await tx.insert(PointTransactions).values(
      eventEnrollments.map((enrollment) => ({
        userId: enrollment.userId,
        amount: 2000,
        cause: 'EVENT_REWARD' as const,
        targetId: enrollment.id,
      })),
    );
  });
} while (eventEnrollmentCount > 0);
