import dayjs from 'dayjs';
import { prismaClient } from '$lib/server/database';
import { createId } from '$lib/utils/id';

let eventEnrollmentCount = 0;
do {
  await prismaClient.$transaction(async (db) => {
    const eventEnrollments = await db.userEventEnrollment.findMany({
      where: {
        eventCode: { in: ['post_publish_202402', 'twitter_spacelink_2024'] },
        eligible: true,
        rewardedAt: null,
      },
      take: 100,
    });

    if ((eventEnrollmentCount = eventEnrollments.length) === 0) return;

    await Promise.all(
      eventEnrollments.map((enrollment) =>
        db.userEventEnrollment.update({
          where: { id: enrollment.id },
          data: { rewardedAt: new Date() },
        }),
      ),
    );

    await db.pointBalance.createMany({
      data: eventEnrollments.map((enrollment) => ({
        id: createId(),
        userId: enrollment.userId,
        kind: 'FREE',
        initial: 2000,
        leftover: 2000,
        expiresAt: dayjs().add(1, 'years').toDate(),
      })),
    });

    await db.pointTransaction.createMany({
      data: eventEnrollments.map((enrollment) => ({
        id: createId(),
        userId: enrollment.userId,
        amount: 2000,
        cause: 'EVENT_REWARD',
        targetId: enrollment.id,
      })),
    });
  });
} while (eventEnrollmentCount > 0);
