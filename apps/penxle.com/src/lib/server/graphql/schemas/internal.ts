import { redis } from '$lib/server/cache';
import { defineSchema } from '../builder';

export const internalSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  const Flash = builder.simpleObject('Flash', {
    fields: (t) => ({
      type: t.string(),
      message: t.string(),
    }),
  });

  /**
   * * Queries
   */

  builder.queryFields((t) => ({
    flash: t.field({
      type: Flash,
      nullable: true,
      resolve: async (_, __, context) => {
        const payload = await redis.getdel(`flash:${context.deviceId}`);
        if (!payload) {
          return null;
        }

        return JSON.parse(payload);
      },
    }),
  }));
});
