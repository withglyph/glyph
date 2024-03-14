import { settleRevenue } from '$lib/server/utils';
import { PrismaEnums } from '$prisma';
import { defineSchema } from '../builder';

export const revenueSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('Revenue', {
    fields: (t) => ({
      id: t.exposeID('id'),
      amount: t.exposeInt('amount'),
      kind: t.expose('kind', { type: PrismaEnums.RevenueKind }),
      state: t.expose('state', { type: PrismaEnums.RevenueState }),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),

      post: t.prismaField({
        type: 'Post',
        nullable: true,
        resolve: async (query, { targetId }, __, { db }) => {
          if (!targetId) return null;

          const postPurchase = await db.postPurchase.findUnique({
            select: { post: query },
            where: { id: targetId },
          });
          return postPurchase?.post;
        },
      }),
    }),
  });

  builder.mutationFields((t) => ({
    instantSettleRevenue: t.withAuth({ user: true }).prismaField({
      type: 'User',
      resolve: async (query, _, __, { db, ...context }) => {
        await settleRevenue({ userId: context.session.userId, settlementType: 'INSTANT' });

        return db.user.findUniqueOrThrow({
          ...query,
          where: { id: context.session.userId },
        });
      },
    }),
  }));
});
