import { match } from 'ts-pattern';
import { PrismaEnums } from '$prisma';
import { defineSchema } from '../builder';

export const notificationSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  const UserNotification = builder.prismaInterface('UserNotification', {
    fields: (t) => ({
      id: t.exposeID('id'),
      user: t.relation('user'),
      category: t.expose('category', { type: PrismaEnums.UserNotificationCategory }),
      state: t.expose('state', { type: PrismaEnums.UserNotificationState }),
      actor: t.relation('actor'),
      data: t.expose('data', { type: 'JSON' }),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
    }),

    resolveType: (notification) =>
      match(notification.category)
        .with('PURCHASE', () => 'PurchaseNotification')
        .with('SUBSCRIBE', () => 'SubscribeNotification')
        .run(),
  });

  builder.prismaObject('UserNotification', {
    variant: 'PurchaseNotification',
    interfaces: [UserNotification],
    fields: (t) => ({
      post: t.prismaField({
        type: 'Post',
        resolve: (query, notification, _, { db }) => {
          const data = notification.data as { postId: string };
          return db.post.findUniqueOrThrow({
            ...query,
            where: {
              id: data.postId,
            },
          });
        },
      }),
    }),
  });

  builder.prismaObject('UserNotification', {
    variant: 'SubscribeNotification',
    interfaces: [UserNotification],
    fields: (t) => ({
      space: t.prismaField({
        type: 'Space',
        resolve: (query, notification, _, { db }) => {
          const data = notification.data as { spaceId: string };
          return db.space.findUniqueOrThrow({
            ...query,
            where: {
              id: data.spaceId,
            },
          });
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
    markNotificationAsRead: t.withAuth({ user: true }).prismaField({
      type: 'UserNotification',
      args: { input: t.arg({ type: MarkNotificationAsReadInput }) },
      resolve: (query, _, { input }, { db, ...context }) => {
        return db.userNotification.update({
          ...query,
          where: {
            id: input.notificationId,
            userId: context.session.userId,
          },
          data: { state: 'READ' },
        });
      },
    }),
  }));
});
