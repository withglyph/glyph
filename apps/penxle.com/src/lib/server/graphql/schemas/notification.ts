import { PrismaEnums } from '$prisma';
import { defineSchema } from '../builder';

export const notificationSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('UserNotification', {
    fields: (t) => ({
      id: t.exposeID('id'),
      user: t.relation('user'),
      category: t.expose('category', { type: PrismaEnums.UserNotificationCategory }),
      state: t.expose('state', { type: PrismaEnums.UserNotificationState }),
      actor: t.relation('actor'),
      data: t.expose('data', { type: 'JSON' }),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
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
