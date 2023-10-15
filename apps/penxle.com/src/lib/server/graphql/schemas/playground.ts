import * as R from 'radash';
import { createRandomAvatar } from '$lib/server/utils/avatar';
import { builder } from '../builder';

/**
 * * Queries
 */

builder.queryFields((t) => ({
  randomAvatars: t.stringList({
    resolve: async () => {
      const buffers = await Promise.all([...R.range(1, 16)].map(() => createRandomAvatar()));
      return buffers.map((buffer) => buffer.toString('base64'));
    },
  }),

  sampleImage: t.prismaField({
    type: 'Image',
    resolve: async (query, _, __, { db }) => {
      return await db.image.findFirstOrThrow({
        ...query,
        where: { name: { startsWith: 'sample' } },
        skip: R.random(0, 99),
        orderBy: { id: 'asc' },
      });
    },
  }),

  sampleImages: t.prismaField({
    type: ['Image'],
    resolve: async (query, _, __, { db }) => {
      return R.shuffle(
        await db.image.findMany({
          ...query,
          where: { name: { startsWith: 'sample' } },
        }),
      );
    },
  }),
}));
