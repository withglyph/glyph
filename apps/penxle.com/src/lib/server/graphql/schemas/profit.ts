import { defineSchema } from '../builder';

export const profitSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('UserProfit', {
    select: { id: true },
    fields: (t) => ({
      id: t.exposeID('id'),
      amount: t.exposeInt('amount'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),

      post: t.prismaField({
        type: 'Post',
        select: (args, ctx, nestedSelection) => ({
          purchase: {
            select: { post: nestedSelection() },
          },
        }),

        resolve: async (_, { purchase }) => purchase.post,
      }),
    }),
  });
});
