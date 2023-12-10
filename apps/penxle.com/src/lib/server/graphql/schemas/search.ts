import * as R from 'radash';
import { openSearch } from '$lib/server/search';
import { builder } from '../builder';

type SearchHits = {
  _id: string;
  _score: number;
  _source: {
    id: string;
    title: string;
    subtitle?: string;
    spaceId: string;
    tags: string[];
  };
};

/**
 * * Queries
 */

builder.queryFields((t) => ({
  searchPost: t.prismaField({
    type: ['Post'],
    args: {
      query: t.arg.string(),
    },
    resolve: async (query, _, args, { db, ...context }) => {
      const searchResult = await openSearch.search({
        index: 'posts',
        body: {
          query: {
            bool: {
              should: [
                { match_phrase: { title: args.query } },
                { match_phrase: { subtitle: args.query } },
                { match: { tags: args.query } },
              ],
              must: [
                {
                  multi_match: {
                    query: args.query,
                    fields: ['title', 'subtitle', 'tags'],
                  },
                },
              ],
            },
          },
        },
      });

      const hits: SearchHits[] = searchResult.body.hits.hits;
      const resultIds = hits.map((hit) => hit._id);
      const posts = R.objectify(
        await db.post.findMany({
          ...query,
          where: {
            id: { in: resultIds },
            state: 'PUBLISHED',
            space: {
              state: 'ACTIVE',
              visibility: 'PUBLIC',
              userMutes: context.session ? { none: { userId: context.session.userId } } : undefined,
            },
            publishedRevision: {
              tags: {
                none: {
                  tag: {
                    userMutes: context.session ? { some: { userId: context.session.userId } } : undefined,
                  },
                },
              },
            },
          },
        }),
        (post) => post.id,
      );

      return R.sift(hits.map((hit) => posts[hit._id]));
    },
  }),
}));
