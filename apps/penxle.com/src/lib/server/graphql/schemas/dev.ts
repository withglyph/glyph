import { dev } from '$app/environment';
import { IntentionalError } from '$lib/errors';
import { indexPost, indexSpace } from '$lib/server/utils';
import { defineSchema } from '../builder';

const BATCH_SIZE = 1000;

export const devSchema = defineSchema((builder) => {
  /**
   * * Mutations
   */

  builder.mutationFields((t) => ({
    reindexSearch: t.field({
      type: 'Void',
      nullable: true,
      resolve: async (_, __, { db }) => {
        if (!dev) {
          throw new IntentionalError('This mutation is only available in development mode.');
        }

        for (let i = 0; ; i++) {
          const posts = await db.post.findMany({
            skip: i * BATCH_SIZE,
            take: BATCH_SIZE,
            include: {
              tags: {
                include: {
                  tag: true,
                },
              },
              publishedRevision: true,
              space: true,
            },
          });

          if (posts.length === 0) break;
          for (const post of posts) indexPost(post);

          console.log(`Reindexed ${i * BATCH_SIZE + posts.length} posts.`);
        }

        for (let i = 0; ; i++) {
          const spaces = await db.space.findMany({
            skip: i * BATCH_SIZE,
            take: BATCH_SIZE,
          });

          if (spaces.length === 0) break;
          for (const space of spaces) indexSpace(space);

          console.log(`Reindexed ${i * BATCH_SIZE + spaces.length} spaces.`);
        }
      },
    }),
  }));
});
