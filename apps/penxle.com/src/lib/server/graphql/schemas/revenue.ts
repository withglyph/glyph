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
});
