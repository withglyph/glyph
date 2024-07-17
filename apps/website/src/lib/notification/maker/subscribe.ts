import { eq } from 'drizzle-orm';
import { database, SpaceFollows, SpaceMembers, Spaces } from '$lib/server/database';
import { createNotification, getSpaceProfile, useFirstRow } from '$lib/server/utils';
import type { NotificationMaker } from './type';

export const subscribeNotificationMaker: NotificationMaker = async (spaceFollowId) => {
  const spaceFollow = await database
    .select({
      followerId: SpaceFollows.userId,
      spaceId: SpaceFollows.spaceId,
      spaceSlug: Spaces.slug,
      spaceName: Spaces.name,
    })
    .from(SpaceFollows)
    .innerJoin(Spaces, eq(SpaceFollows.spaceId, Spaces.id))
    .where(eq(SpaceFollows.id, spaceFollowId))
    .then(useFirstRow);

  if (!spaceFollow) {
    return;
  }

  const profile = await getSpaceProfile({ spaceId: spaceFollow.spaceId, userId: spaceFollow.followerId });

  const spaceMemberIds = await database
    .select({
      userId: SpaceMembers.userId,
    })
    .from(SpaceMembers)
    .where(eq(SpaceMembers.spaceId, spaceFollow.spaceId))
    .then((rows) => rows.map((row) => row.userId));

  await Promise.all(
    spaceMemberIds.map(async (userId) => {
      await createNotification({
        userId,
        category: 'SUBSCRIBE',
        actorId: profile.id,
        data: {
          spaceId: spaceFollow.spaceId,
        },
        pushTitle: spaceFollow.spaceName,
        pushBody: `${profile.name}님이 스페이스를 구독했어요.`,
        pushPath: `${spaceFollow.spaceSlug}`,
      });
    }),
  );
};
