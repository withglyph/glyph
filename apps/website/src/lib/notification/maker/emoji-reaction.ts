import { eq } from 'drizzle-orm';
import { database, PostReactions, PostRevisions, Posts, Spaces } from '$lib/server/database';
import { createNotification, getSpaceProfile, useFirstRow } from '$lib/server/utils';
import type { NotificationMaker } from './type';

export const emojiReactionNotificationMaker: NotificationMaker = async (reactionId) => {
  const reaction = await database
    .select({
      emoji: PostReactions.emoji,
      postId: Posts.id,
      postPermalink: Posts.permalink,
      title: PostRevisions.title,
      postWriterId: Posts.userId,
      spaceId: Posts.spaceId,
      spaceSlug: Spaces.slug,
      emojigazerId: PostReactions.userId,
    })
    .from(PostReactions)
    .innerJoin(Posts, eq(PostReactions.postId, Posts.id))
    .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
    .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
    .where(eq(PostReactions.id, reactionId))
    .then(useFirstRow);

  if (!reaction || !reaction.spaceId || reaction.postWriterId === reaction.emojigazerId) {
    return;
  }

  const profile = await getSpaceProfile({ spaceId: reaction.spaceId, userId: reaction.emojigazerId });

  await createNotification({
    userId: reaction.postWriterId,
    category: 'EMOJI_REACTION',
    actorId: profile.id,
    data: {
      postId: reaction.postId,
      emoji: reaction.emoji,
    },
    pushTitle: reaction.title ?? '(제목 없음)',
    pushBody: `${profile.name}님이 이모지를 남겼어요.`,
    pushPath: `/${reaction.spaceSlug}/${reaction.postPermalink}`,
  });
};
