import { match } from 'ts-pattern';
import { elasticSearch, indexName } from '$lib/server/search';
import { makeQueryContainers, searchResultToPrismaData } from '$lib/server/utils';
import { disassembleHangulString } from '$lib/utils';
import { PrismaEnums } from '$prisma';
import { builder } from '../builder';
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

    posts: t.prismaField({
      type: ['Post'],
      resolve: async (query, { result }, __, { db }) => {
        return searchResultToPrismaData({
          searchResult: result,
          db,
          tableName: 'post',
          queryArgs: {
            ...query,
            where: {
              state: 'PUBLISHED',
              visibility: 'PUBLIC',
              space: {
                state: 'ACTIVE',
                visibility: 'PUBLIC',
              },
            },
          },
        });
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
    },
    resolve: async (_, args, { db, ...context }) => {
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

            filter: {
              bool: {
                must: makeQueryContainers([
                  { query: { term: { ageRating: 'R19' } }, condition: args.adultFilter === true },
                  ...args.includeTags.map((tag) => ({
                    query: { term: { ['tags.nameRaw']: tag } },
                  })),
                ]),

                must_not: makeQueryContainers([
                  {
                    query: {
                      terms: { ['tags.id']: mutedTags.map(({ tagId }) => tagId) },
                    },
                    condition: mutedTags.length > 0,
                  },
                  {
                    query: {
                      terms: { spaceId: mutedSpaces.map(({ spaceId }) => spaceId) },
                    },
                    condition: mutedSpaces.length > 0,
                  },
                  {
                    query: {
                      terms: { ['tags.nameRaw']: args.excludeTags },
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
              },
            },
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

  searchSpaces: t.prismaField({
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

      const searchResult = await elasticSearch.search({
        index: indexName('spaces'),
        query: {
          bool: {
            should: [{ match_phrase: { name: args.query } }],
            must: [
              {
                multi_match: {
                  query: args.query,
                  fields: ['name'],
                  type: 'phrase_prefix',
                },
              },
            ],
            filter: {
              bool: {
                must_not: makeQueryContainers([
                  {
                    query: {
                      ids: { values: mutedSpaces.map(({ spaceId }) => spaceId) },
                    },
                    condition: mutedSpaces.length > 0,
                  },
                ]),
              },
            },
          },
        },
      });

      return searchResultToPrismaData({
        searchResult,
        db,
        tableName: 'space',
        queryArgs: {
          ...query,
          where: {
            state: 'ACTIVE',
            visibility: 'PUBLIC',
          },
        },
      });
    },
  }),

  searchTags: t.prismaField({
    type: ['Tag'],
    args: { query: t.arg.string() },
    resolve: async (query, _, args, { db, ...context }) => {
      const mutedTags = context.session
        ? await db.userTagMute.findMany({
            where: { userId: context.session.userId },
          })
        : [];

      const searchResult = await elasticSearch.search({
        index: indexName('tags'),
        min_score: 0.01,
        query: {
          bool: {
            should: [
              { match_phrase: { 'name.raw^2': args.query } },
              {
                match_phrase: /^[ㄱ-ㅎ]+$/.test(args.query)
                  ? { 'name.initial': args.query }
                  : { 'name.disassembled': disassembleHangulString(args.query) },
              },
            ],
            filter: {
              bool: {
                must_not: {
                  ids: { values: mutedTags.map(({ tagId }) => tagId) },
                },
              },
            },
          },
        },
      });

      return searchResultToPrismaData({
        searchResult,
        db,
        tableName: 'tag',
        queryArgs: query,
      });
    },
  }),

  autoCompleteTags: t.prismaField({
    type: ['Tag'],
    args: { query: t.arg.string(), kind: t.arg({ type: PrismaEnums.PostTagKind }) },
    resolve: async (query, _, args, { db, ...context }) => {
      const mutedTags = context.session
        ? await db.userTagMute.findMany({
            where: { userId: context.session.userId },
          })
        : [];

      const searchResult = await elasticSearch.search({
        index: indexName('tags'),
        min_score: 0.01,
        query: {
          bool: {
            should: [
              { match_phrase: { 'name.raw^2': args.query } },
              {
                match_phrase: /^[ㄱ-ㅎ]+$/.test(args.query)
                  ? { 'name.initial': args.query }
                  : { 'name.disassembled': disassembleHangulString(args.query) },
              },
              {
                rank_feature: {
                  field: `usageCount.${args.kind}`,
                  saturation: { pivot: 10 },
                },
              },
            ],
            filter: {
              bool: {
                must_not: {
                  ids: { values: mutedTags.map(({ tagId }) => tagId) },
                },
              },
            },
          },
        },
      });

      return searchResultToPrismaData({
        searchResult,
        db,
        tableName: 'tag',
        queryArgs: query,
      });
    },
  }),
}));
