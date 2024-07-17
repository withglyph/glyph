import { desc } from 'drizzle-orm';
import { useCache } from '$lib/server/cache';
import { Banners, database } from '$lib/server/database';
import { builder } from '../builder';
import { createObjectRef } from '../utils';

export const Banner = createObjectRef('Banner', Banners);
Banner.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    subtitle: t.exposeString('subtitle'),
    bottomline: t.exposeString('bottomline', { nullable: true }),
    color: t.exposeString('color'),
    backgroundImageUrl: t.exposeString('backgroundImageUrl'),
    href: t.exposeString('href'),
  }),
});

builder.queryFields((t) => ({
  banners: t.field({
    type: [Banner],
    resolve: async () => {
      return await useCache(
        `Banners`,
        () => {
          return database.select().from(Banners).orderBy(desc(Banners.createdAt));
        },
        60,
      );
    },
  }),
}));
