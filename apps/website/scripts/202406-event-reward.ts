/* eslint-disable unicorn/no-process-exit */
import dayjs from 'dayjs';
import { and, eq, isNotNull } from 'drizzle-orm';
import {
  database,
  inArray,
  PointBalances,
  PointTransactions,
  UserEventEnrollments,
  UserPersonalIdentities,
} from '$lib/server/database';

for (let i = 0; ; i++) {
  await database.transaction(async (tx) => {
    const eventEnrollment = await tx
      .select({ UserEventEnrollments })
      .from(UserEventEnrollments)
      .innerJoin(UserPersonalIdentities, eq(UserEventEnrollments.userId, UserPersonalIdentities.userId))
      .where(and(eq(UserEventEnrollments.eventCode, 'weekly_challenge_24064'), eq(UserEventEnrollments.eligible, true)))
      .orderBy(UserEventEnrollments.id)
      .limit(1)
      .offset(i)
      .for('update')
      .then((rows) => rows[0]?.UserEventEnrollments);

    if (!eventEnrollment) {
      console.log('끗!!');
      process.exit(0);
    }

    if (eventEnrollment.rewardedAt) {
      return;
    }

    const beforeRewardedEnrollments = await tx
      .select({ id: UserEventEnrollments.id })
      .from(UserEventEnrollments)
      .where(
        and(
          inArray(UserEventEnrollments.eventCode, [
            'weekly_challenge_24061',
            'weekly_challenge_24062',
            'weekly_challenge_24063',
          ]),
          eq(UserEventEnrollments.userId, eventEnrollment.userId),
          isNotNull(UserEventEnrollments.rewardedAt),
        ),
      )
      .for('update');

    if (beforeRewardedEnrollments.length > 0) {
      console.log(`${eventEnrollment.userId} 이미 전주차에 보상 받음`);
      return;
    }

    await tx
      .update(UserEventEnrollments)
      .set({ rewardedAt: dayjs() })
      .where(eq(UserEventEnrollments.id, eventEnrollment.id));

    await tx.insert(PointBalances).values({
      userId: eventEnrollment.userId,
      kind: 'FREE' as const,
      initial: 2000,
      leftover: 2000,
      expiresAt: dayjs().add(1, 'years'),
    });

    await tx.insert(PointTransactions).values({
      userId: eventEnrollment.userId,
      amount: 2000,
      cause: 'EVENT_REWARD' as const,
      targetId: eventEnrollment.id,
    });

    console.log(`${eventEnrollment.userId} 2000포인트 지급`);
  });
}
