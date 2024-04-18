import { inArray } from 'drizzle-orm';
import { database, Posts } from '../database';
import type { Context } from '../context';

type LoaderContext = Pick<Context, 'loader' | 'session'>;

export const postById = (context: LoaderContext) =>
  context.loader({
    name: 'postById',
    load: async (postIds: string[]) => {
      return await database
        .select({ Posts })
        .from(Posts)
        .where(inArray(Posts.id, postIds))
        .then((rows) => rows.map((row) => row.Posts));
    },
    key: (row) => row.id,
  });
