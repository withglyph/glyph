import { ContentFilterCategory } from '@prisma/client';
import * as R from 'radash';
import { match } from 'ts-pattern';
import { openSearch } from '$lib/server/search';
import { disassembleHangulString } from '$lib/utils';
import { defineSchema } from '../builder';

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

export const searchSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  const OrderByKind = builder.enumType('OrderByKind', {
    values: ['ACCURACY', 'LATEST'],
  });

  /**
   * * Queries
   */

  builder.queryFields((t) => ({
    recommendFeed: t.prismaField({
      type: ['Post'],
      resolve: async (query, _, __, { db, ...context }) => {
        const [mutedTags, mutedSpaces] = await Promise.all([
          context.session
            ? await db.userTagMute.findMany({
                where: { userId: context.session.userId },
              })
            : [],
          context.session
            ? await db.userSpaceMute.findMany({
                where: { userId: context.session.userId },
              })
            : [],
        ]);

        const muteTerms = R.sift([
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
        ]);

        const searchResult = await openSearch.search({
          index: 'posts',
          body: {
            query: {
              function_score: {
                query:
                  muteTerms.length > 0
                    ? {
                        bool: {
                          filter: {
                            bool: {
                              must_not: muteTerms,
                            },
                          },
                        },
                      }
                    : undefined,
                random_score: {},
              },
            },

            size: 20,
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

    searchPosts: t.prismaField({
      type: ['Post'],
      args: {
        query: t.arg.string(),
        includeTags: t.arg.stringList({ defaultValue: [] }),
        excludeTags: t.arg.stringList({ defaultValue: [] }),
        adultFilter: t.arg.boolean({ required: false }),
        excludeContentFilters: t.arg({ type: [ContentFilterCategory], required: false }),
        orderBy: t.arg({ type: OrderByKind, defaultValue: 'ACCURACY' }),
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
                  { match: { 'tags.name': args.query } },
                ],

                must: [
                  {
                    multi_match: {
                      query: args.query,
                      fields: ['title', 'subtitle', 'tags.name'],
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

            sort: match(args.orderBy)
              .with('ACCURACY', () => ['_score'])
              .with('LATEST', () => [{ publishedAt: 'desc' }])
              .otherwise(() => []),
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
          index: 'tags',
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

        const hits: SearchHits[] = searchResult.body.hits.hits;
        const resultIds = hits.map((hit) => hit._id);
        const tags = R.objectify(
          await db.tag.findMany({
            ...query,
            where: {
              id: { in: resultIds },
            },
          }),
          (tag) => tag.id,
        );

        return R.sift(hits.map((hit) => tags[hit._id]));
      },
    }),
  }));
});
