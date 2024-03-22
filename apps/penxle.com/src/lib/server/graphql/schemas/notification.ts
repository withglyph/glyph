import { and, eq } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { NotFoundError } from '$lib/errors';
import {
  database,
  dbEnum,
  PostComments,
  UserNotificationCategory,
  UserNotifications,
  UserNotificationState,
} from '$lib/server/database';
import { builder } from '../builder';
import { makeLoadableObjectFields } from '../utils';
import { PostComment } from './comment';
import { Post } from './post';
import { Space } from './space';
import { Profile } from './user';

/**
 * * Types
 */

export const UserNotification = builder.loadableInterface('UserNotification', {
  ...makeLoadableObjectFields(UserNotifications),
  fields: (t) => ({
    id: t.exposeID('id'),
    category: t.expose('category', { type: dbEnum(UserNotificationCategory) }),
    state: t.expose('state', { type: dbEnum(UserNotificationState) }),
    data: t.expose('data', { type: 'JSON' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    actor: t.field({
      type: Profile,
      nullable: true,
      resolve: (notification) => notification.actorId,
    }),
  }),

  resolveType: (notification) =>
    match(notification.category)
      .with('PURCHASE', () => 'PurchaseNotification')
      .with('SUBSCRIBE', () => 'SubscribeNotification')
      .with('COMMENT', () => 'CommentNotification')
      .run(),
});

export const PurchaseNotification = builder.loadableObject('PurchaseNotification', {
  ...makeLoadableObjectFields(UserNotifications),
  interfaces: [UserNotification],
  fields: (t) => ({
    post: t.field({
      type: Post,
      resolve: async (notification) => {
        const data = notification.data as { postId: string };
        return data.postId;
      },
    }),
  }),
});

export const SubscribeNotification = builder.loadableObject('SubscribeNotification', {
  ...makeLoadableObjectFields(UserNotifications),
  interfaces: [UserNotification],
  fields: (t) => ({
    space: t.field({
      type: Space,
      resolve: (notification) => {
        const data = notification.data as { spaceId: string };
        return data.spaceId;
      },
    }),
  }),
});

export const CommentNotification = builder.loadableObject('CommentNotification', {
  ...makeLoadableObjectFields(UserNotifications),
  interfaces: [UserNotification],
  fields: (t) => ({
    post: t.field({
      type: Post,
      resolve: async (notification) => {
        const data = notification.data as { commentId: string };

        const comments = await database
          .select({ postId: PostComments.postId })
          .from(PostComments)
          .where(eq(PostComments.id, data.commentId));

        if (comments.length === 0) {
          throw new NotFoundError();
        }

        return comments[0].postId;
      },
    }),

    comment: t.field({
      type: PostComment,
      resolve: async (notification) => {
        const data = notification.data as { commentId: string };
        return data.commentId;
      },
    }),

    parentComment: t.field({
      type: PostComment,
      nullable: true,
      resolve: async (notification) => {
        const data = notification.data as { commentId: string };

        const comments = await database
          .select({ parentId: PostComments.parentId })
          .from(PostComments)
          .where(eq(PostComments.id, data.commentId));

        if (comments.length === 0) {
          throw new NotFoundError();
        }

        return comments[0].parentId;
      },
    }),
  }),
});
/**
 * * Inputs
 */

const MarkNotificationAsReadInput = builder.inputType('MarkNotificationAsReadInput', {
  fields: (t) => ({
    notificationId: t.id(),
  }),
});

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  markNotificationAsRead: t.withAuth({ user: true }).field({
    type: UserNotification,
    args: { input: t.arg({ type: MarkNotificationAsReadInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .update(UserNotifications)
        .set({ state: 'READ' })
        .where(
          and(eq(UserNotifications.id, input.notificationId), eq(UserNotifications.userId, context.session.userId)),
        );

      return input.notificationId;
    },
  }),
}));
