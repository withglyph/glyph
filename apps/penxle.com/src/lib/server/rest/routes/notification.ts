import { status } from 'itty-router';
import { match } from 'ts-pattern';
import { createRouter } from '../router';
import type { IRequest } from 'itty-router';
import type { Notification } from '$lib/utils';

export const notification = createRouter();

notification.get('/notification/:notificationId', async (request, { db }) => {
  const notificationId = (request as IRequest).params.notificationId;
  if (!notificationId) {
    throw new Error('notificationId is required');
  }

  const notification = (await db.userNotification.findUnique({
    where: { id: notificationId },
  })) as unknown as Notification;

  if (!notification) {
    return status(307, { headers: { Location: `/404` } });
  }

  return status(307, {
    headers: {
      Location: await match(notification)
        .with({ category: 'PURCHASE' }, async ({ data }) => {
          const post = await db.post.findUniqueOrThrow({
            include: { space: true },
            where: { id: data.postId },
          });

          if (!post.space) {
            return `/404`;
          }

          return `/${post.space.slug}/${post.permalink}`;
        })
        .with({ category: 'SUBSCRIBE' }, async ({ data }) => {
          const space = await db.space.findUniqueOrThrow({
            where: { id: data.spaceId },
          });

          return `/${space.slug}`;
        })
        .with({ category: 'COMMENT' }, async ({ data }) => {
          const comment = await db.postComment.findUniqueOrThrow({
            include: { post: { include: { space: true } } },
            where: { id: data.commentId },
          });

          if (!comment.post.space) {
            return `/404`;
          }

          return `/${comment.post.space.slug}/${comment.post.permalink}`;
        })
        .exhaustive(),
    },
  });
});
