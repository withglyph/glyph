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
      const mutedTags = context.session
        ? await db.userTagMute.findMany({
            where: { userId: context.session.userId },
          })
        : [];

      const mutedSpaces = context.session
        ? await db.userSpaceMute.findMany({
            where: { userId: context.session.userId },
          })
        : [];

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
              must_not: R.sift([
                mutedTags.length > 0
                  ? {
                      terms: { ['tags.id']: mutedTags.map(({ tagId }) => tagId) },
                    }
                  : undefined,
                mutedSpaces.length > 0
                  ? {
                      terms: { spaceId: mutedSpaces.map(({ spaceId }) => spaceId) },
                    }
                  : undefined,
              ]),
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
            },
          },
        }),
        (post) => post.id,
      );

      return R.sift(hits.map((hit) => posts[hit._id]));
    },
  }),

  searchSpace: t.prismaField({
    type: ['Space'],
    args: {
      query: t.arg.string(),
    },
    resolve: async (query, _, args, { db, ...context }) => {
      const mutedSpaces = context.session
        ? await db.userSpaceMute.findMany({
            where: { userId: context.session.userId },
          })
        : [];

      const searchResult = await openSearch.search({
        index: 'spaces',
        body: {
          query: {
            bool: {
              should: [{ match_phrase: { name: args.query } }],
              must: [
                {
                  multi_match: {
                    query: args.query,
                    fields: ['name'],
                  },
                },
              ],
              must_not: R.sift([
                mutedSpaces.length > 0
                  ? {
                      ids: { values: mutedSpaces.map(({ spaceId }) => spaceId) },
                    }
                  : undefined,
              ]),
            },
          },
        },
      });

      const hits: SearchHits[] = searchResult.body.hits.hits;
      const resultIds = hits.map((hit) => hit._id);
      const spaces = R.objectify(
        await db.space.findMany({
          ...query,
          where: {
            id: { in: resultIds },
          },
        }),
        (space) => space.id,
      );

      return R.sift(hits.map((hit) => spaces[hit._id]));
    },
  }),
}));
