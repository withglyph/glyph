import stringHash from '@sindresorhus/string-hash';
import { gt } from 'drizzle-orm';
import { FeatureFlag } from '$lib/enums';
import { redis } from '$lib/server/cache';
import { database, FeatureFlags } from '$lib/server/database';
import { builder } from '../builder';

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

  featureFlags: t.field({
    type: [FeatureFlag],
    resolve: async (_, __, context) => {
      const flags = new Set<keyof typeof FeatureFlag>();

      const cookie = context.event.cookies.get('glyph-ff');
      if (cookie) {
        const parsed = JSON.parse(cookie);
        for (const value of parsed) {
          flags.add(value);
        }
        return [...flags];
      }

      const deviceKey = Math.abs(stringHash(context.deviceId) % 100);
      const ratios = await database
        .select({ flag: FeatureFlags.flag, ratio: FeatureFlags.ratio })
        .from(FeatureFlags)
        .where(gt(FeatureFlags.ratio, 0));

      for (const { flag, ratio } of ratios) {
        if (deviceKey < ratio) {
          flags.add(flag);
        }
      }

      if (deviceKey < 10) {
        flags.add('SHOW_AD');
      }

      return [...flags];
    },
  }),
}));
