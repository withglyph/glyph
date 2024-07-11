import { eq } from 'drizzle-orm';
import { database, PostPurchases, PostRevisions, Posts } from '$lib/server/database';
import { createNotification, getSpaceProfile, useFirstRow } from '$lib/server/utils';
import type { NotificationMaker } from './type';

export const purchaseNotificationMaker: NotificationMaker = async (purchaseId) => {
  const purchase = await database
    .select({
      postId: PostPurchases.postId,
      buyerId: PostPurchases.userId,
      postWriterId: Posts.userId,
      spaceId: Posts.spaceId,
      postTitle: PostRevisions.title,
    })
    .from(PostPurchases)
    .innerJoin(Posts, eq(PostPurchases.postId, Posts.id))
    .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
    .where(eq(PostPurchases.id, purchaseId))
    .then(useFirstRow);

  if (!purchase || !purchase.spaceId) {
    return;
  }

  const profile = await getSpaceProfile({ spaceId: purchase.spaceId, userId: purchase.buyerId });

  await createNotification({
    userId: purchase.postWriterId,
    category: 'PURCHASE',
    actorId: profile.id,
    data: {
      postId: purchase.postId,
    },
    pushTitle: purchase.postTitle ?? '(제목 없음)',
    pushBody: `${profile.name}님이 포스트를 구매했어요.`,
    pushPath: '/me/revenue',
  });
};
