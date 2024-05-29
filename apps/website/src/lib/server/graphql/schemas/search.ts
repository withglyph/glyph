import { match } from 'ts-pattern';
import { elasticSearch, indexName } from '$lib/server/search';
import {
  getFollowingTagIds,
  getMutedSpaceIds,
  getMutedTagIds,
  makeQueryContainers,
  searchResultToIds,
} from '$lib/server/utils';
import { disassembleHangulString } from '$lib/utils';
import { builder } from '../builder';
import { Post } from './post';
import { Tag } from './tag';
import type { SearchResponse } from '$lib/server/utils';

/**
 * * Types
 */

const OrderByKind = builder.enumType('SearchOrderByKind', {
  values: ['ACCURACY', 'LATEST'],
});

class SearchResult {
  result!: SearchResponse;
}

builder.objectType(SearchResult, {
  name: 'SearchResult',
  fields: (t) => ({
    count: t.field({
      type: 'Int',
      resolve: ({ result }) => {
        const total = result.hits.total;
        if (typeof total === 'number') return total;
        return total?.value ?? 0;
      },
    }),

    posts: t.field({
      type: [Post],
      resolve: ({ result }) => {
        return result.hits.hits.map((hit) => hit._id);
      },
    }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  searchPosts: t.field({
    type: SearchResult,
    args: {
      query: t.arg.string(),
      includeTags: t.arg.stringList({ defaultValue: [] }),
      excludeTags: t.arg.stringList({ defaultValue: [] }),
      adultFilter: t.arg.boolean({ required: false }),
      orderBy: t.arg({ type: OrderByKind, defaultValue: 'ACCURACY' }),
      page: t.arg.int({ defaultValue: 1 }),
      take: t.arg.int({ defaultValue: 10 }),
    },
    resolve: async (_, args, context) => {
      const [mutedTagIds, mutedSpaceIds] = await Promise.all([
        getMutedTagIds({ userId: context.session?.userId }),
        getMutedSpaceIds({ userId: context.session?.userId }),
      ]);

      const searchResult = await elasticSearch.search({
        index: indexName('posts'),
        query: {
          bool: {
            should: [{ term: { 'tags.nameRaw': args.query } }],

            must: [
              {
                multi_match: {
                  query: args.query,
                  fields: ['title', 'subtitle', 'tags.name'],
                  type: 'phrase_prefix',
                },
              },
            ],

            must_not: makeQueryContainers([
              {
                query: {
                  terms: { 'tags.id': mutedTagIds },
                },
                condition: mutedTagIds.length > 0,
              },
              {
                query: {
                  terms: { 'space.id': mutedSpaceIds },
                },
                condition: mutedSpaceIds.length > 0,
              },
              {
                query: {
                  terms: { ['tags.name.raw']: args.excludeTags },
                },
                condition: args.excludeTags.length > 0,
              },
              {
                query: {
                  term: { ageRating: 'R19' },
                },
                condition: args.adultFilter === false,
              },
            ]),

            filter: makeQueryContainers([
              { query: { term: { ageRating: 'R19' } }, condition: args.adultFilter === true },
              ...args.includeTags.map((tag) => ({
                query: { term: { ['tags.name.raw']: tag } },
              })),
            ]),
          },
        },

        size: 10,
        from: (args.page - 1) * 10,
        sort: match(args.orderBy)
          .with('ACCURACY', () => ['_score'])
          .with('LATEST', () => [{ publishedAt: 'desc' as const }])
          .otherwise(() => undefined),
      });

      return { result: searchResult };
    },
  }),

  searchTags: t.field({
    type: [Tag],
    args: {
      query: t.arg.string(),
      excludeMute: t.arg.boolean({ defaultValue: true }),
      excludeFollow: t.arg.boolean({ defaultValue: false }),
    },
    resolve: async (_, args, context) => {
      const [mutedTagIds, followingTagIds] = await Promise.all([
        args.excludeMute ? getMutedTagIds({ userId: context.session?.userId }) : [],
        args.excludeFollow ? getFollowingTagIds(context.session?.userId) : [],
      ]);

      const excludeTagIds = [...mutedTagIds, ...followingTagIds];

      const searchResult = await elasticSearch.search({
        index: indexName('tags'),
        query: {
          bool: {
            should: [
              { match_phrase: { 'name.raw': { query: args.query, boost: 2 } } },
              {
                match_phrase: /^[ㄱ-ㅎ]+$/.test(args.query)
                  ? { 'name.initial': args.query }
                  : { 'name.disassembled': disassembleHangulString(args.query) },
              },
            ],
            must_not: makeQueryContainers([
              {
                query: { ids: { values: excludeTagIds } },
                condition: excludeTagIds.length > 0,
              },
            ]),
          },
        },
      });

      return searchResultToIds(searchResult);
    },
  }),
}));
