import { and, eq } from 'drizzle-orm';
import { database, PostComments, PostRevisions, Posts, Profiles, Spaces } from '$lib/server/database';
import { createNotification, useFirstRow } from '$lib/server/utils';
import type { NotificationMaker } from './type';

export const commentNotificationMaker: NotificationMaker = async (commentId) => {
  const comment = await database
    .select({
      id: PostComments.id,
      content: PostComments.content,
      commenterId: PostComments.userId,
      profileId: PostComments.profileId,
      profileName: Profiles.name,
      spaceId: Posts.spaceId,
      spaceSlug: Spaces.slug,
      postPermalink: Posts.permalink,
      postWriterId: Posts.userId,
      postTitle: PostRevisions.title,
      parentId: PostComments.parentId,
    })
    .from(PostComments)
    .innerJoin(Posts, eq(PostComments.postId, Posts.id))
    .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
    .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
    .innerJoin(Profiles, eq(PostComments.profileId, Profiles.id))
    .where(and(eq(PostComments.id, commentId), eq(PostComments.state, 'ACTIVE')))
    .then(useFirstRow);

  if (!comment || !comment.spaceId) {
    return;
  }

  let notifiedUserId = comment.postWriterId;

  if (comment.parentId) {
    const parentComment = await database
      .select({
        userId: PostComments.userId,
      })
      .from(PostComments)
      .where(and(eq(PostComments.id, comment.parentId), eq(PostComments.state, 'ACTIVE')))
      .then(useFirstRow);

    if (parentComment) {
      if (parentComment.userId === comment.commenterId) {
        return;
      }

      notifiedUserId = parentComment.userId;
    }
  } else if (notifiedUserId === comment.commenterId) {
    return;
  }

  await createNotification({
    userId: notifiedUserId,
    category: 'COMMENT',
    actorId: comment.profileId,
    data: {
      commentId: comment.id,
    },
    pushTitle: comment.postTitle ?? '(제목 없음)',
    pushBody: `${comment.profileName}님이 "${comment.content}" 댓글을 남겼어요.`,
    pushPath: `${comment.spaceSlug}/${comment.postPermalink}`,
  });
};
