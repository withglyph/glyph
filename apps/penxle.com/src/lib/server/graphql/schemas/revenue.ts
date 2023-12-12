import { RevenueKind, RevenueState } from '@prisma/client';
import { defineSchema } from '../builder';

export const revenueSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('Revenue', {
    fields: (t) => ({
      id: t.exposeID('id'),
      amount: t.exposeInt('amount'),
      kind: t.expose('kind', { type: RevenueKind }),
      state: t.expose('state', { type: RevenueState }),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
    }),
  });
});
