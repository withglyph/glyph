import { ContentFilterCategory } from '@prisma/client';
import * as R from 'radash';
import { match } from 'ts-pattern';
import { indexName, openSearch } from '$lib/server/search';
import { searchResultToPrismaData } from '$lib/server/utils';
import { disassembleHangulString } from '$lib/utils';
import { defineSchema } from '../builder';
import type { ApiResponse } from '@opensearch-project/opensearch';

export const searchSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  const OrderByKind = builder.enumType('OrderByKind', {
    values: ['ACCURACY', 'LATEST'],
  });

  class SearchResult {
    result!: ApiResponse;
  }

  builder.objectType(SearchResult, {
    name: 'SearchResult',
    fields: (t) => ({
      count: t.field({
        type: 'Int',
        resolve: ({ result }) => result.body.hits.total.value ?? 0,
      }),

      posts: t.prismaField({
        type: ['Post'],
        resolve: async (query, { result }, __, { db }) => {
          return await searchResultToPrismaData({
            searchResult: result,
            db,
            tableName: 'post',
            queryArgs: {
              ...query,
              where: {
                state: 'PUBLISHED',
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
        excludeContentFilters: t.arg({ type: [ContentFilterCategory], required: false }),
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

        const searchResult = await openSearch.search({
          index: indexName('posts'),
          body: {
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
                    must: R.sift([
                      args.adultFilter === true ? { term: { contentFilters: 'ADULT' } } : undefined,
                      ...args.includeTags.map((tag) => ({
                        term: { ['tags.nameRaw']: tag },
                      })),
                    ]),
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
                      args.excludeTags.length > 0
                        ? {
                            terms: { ['tags.nameRaw']: args.excludeTags },
                          }
                        : undefined,
                      args.adultFilter === false ? { term: { contentFilters: 'ADULT' } } : undefined,
                      args.excludeContentFilters?.length ?? 0 > 0
                        ? { terms: { contentFilters: args.excludeContentFilters } }
                        : undefined,
                    ]),
                  },
                },
              },
            },

            size: 10,
            from: (args.page - 1) * 10,
            sort: match(args.orderBy)
              .with('ACCURACY', () => ['_score'])
              .with('LATEST', () => [{ publishedAt: 'desc' }])
              .otherwise(() => []),
          },
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

        const searchResult = await openSearch.search({
          index: indexName('spaces'),
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
                filter: {
                  bool: {
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
            },
          },
        });

        return searchResultToPrismaData({
          searchResult,
          db,
          tableName: 'space',
          queryArgs: query,
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

        const searchResult = await openSearch.search({
          index: indexName('tags'),
          body: {
            query: {
              bool: {
                should: [
                  { match_phrase: { 'name.raw': args.query } },
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
});
