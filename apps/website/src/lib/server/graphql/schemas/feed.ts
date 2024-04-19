import dayjs from 'dayjs';
import { and, countDistinct, desc, eq, gt, ne, notExists } from 'drizzle-orm';
import * as R from 'radash';
import { useCache } from '$lib/server/cache';
import {
  CurationPosts,
  database,
  inArray,
  notInArray,
  Posts,
  PostTags,
  PostViews,
  SpaceFollows,
  Spaces,
  TagFollows,
  UserPersonalIdentities,
  UserSpaceMutes,
  UserTagMutes,
} from '$lib/server/database';
import { elasticSearch, indexName } from '$lib/server/search';
import {
  getMutedSpaceIds,
  getMutedTagIds,
  isAdulthood,
  isGte15,
  makeQueryContainers,
  searchResultToIds,
  useFirstRow,
} from '$lib/server/utils';
import { builder } from '../builder';
import { SpaceCollection } from './collection';
import { Post } from './post';
import { Tag } from './tag';

/**
 * * Types
 */

class FeaturedTag {
  tagId!: string;
}

builder.objectType(FeaturedTag, {
  name: 'FeaturedTag',
  fields: (t) => ({
    tag: t.field({
      type: Tag,
      resolve: ({ tagId }) => tagId,
    }),
    posts: t.field({
      type: [Post],
      resolve: async ({ tagId }, _, context) => {
        const [mutedTagIds, mutedSpaceIds] = context.session
          ? await Promise.all([
              getMutedTagIds({ userId: context.session.userId }),
              getMutedSpaceIds({ userId: context.session.userId }),
            ])
          : [[], []];

        const searchResult = await elasticSearch.search({
          index: indexName('posts'),
          query: {
            function_score: {
              query: {
                bool: {
                  must_not: makeQueryContainers([
                    {
                      query: { terms: { ['tags.id']: mutedTagIds } },
                      condition: mutedTagIds.length > 0,
                    },
                    {
                      query: { terms: { 'space.id': mutedSpaceIds } },
                      condition: mutedSpaceIds.length > 0,
                    },
                  ]),

                  must: { match_all: {} },
                  should: { term: { hasThumbnail: true } },
                  filter: [{ term: { ['tags.id']: tagId } }],
                },
              },
              functions: [
                {
                  random_score: { seed: Math.floor(Math.random() * 1000), field: '_seq_no' },
                },
                {
                  exp: {
                    publishedAt: {
                      scale: '30d',
                      offset: '7d',
                    },
                  },
                },
              ],
            },
          },
          size: 10,
        });

        return searchResultToIds(searchResult);
      },
    }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  recommendFeed: t.field({
    type: [Post],
    resolve: async (_, __, context) => {
      const searchResult = await (async () => {
        if (context.session) {
          const [mutedTagIds, mutedSpaceIds, followingTagIds, viewedPostIds, userBirthday] = await Promise.all([
            getMutedTagIds({ userId: context.session.userId }),
            getMutedSpaceIds({ userId: context.session.userId }),
            database
              .select({ tagId: TagFollows.tagId })
              .from(TagFollows)
              .where(eq(TagFollows.userId, context.session.userId))
              .then((rows) => rows.map((row) => row.tagId)),
            database
              .select({ postId: PostViews.postId })
              .from(PostViews)
              .where(eq(PostViews.userId, context.session.userId))
              .orderBy(desc(PostViews.viewedAt))
              .limit(100)
              .then((rows) => rows.map((row) => row.postId)),
            database
              .select({ birthday: UserPersonalIdentities.birthday })
              .from(UserPersonalIdentities)
              .where(eq(UserPersonalIdentities.userId, context.session.userId))
              .then(useFirstRow)
              .then((row) => row?.birthday),
          ]);

          const viewedTagIds =
            viewedPostIds.length > 0
              ? await database
                  .select({ tagId: PostTags.tagId })
                  .from(PostTags)
                  .where(inArray(PostTags.postId, viewedPostIds))
                  .groupBy(PostTags.tagId)
                  .then((rows) => rows.map((row) => row.tagId))
              : [];

          const allowedAgeRating = userBirthday
            ? R.sift([isAdulthood(userBirthday) && 'R19', isGte15(userBirthday) && 'R15', 'ALL'])
            : ['ALL'];

          return elasticSearch.search({
            index: indexName('posts'),
            query: {
              function_score: {
                query: {
                  bool: {
                    must_not: makeQueryContainers([
                      {
                        query: { terms: { ['tags.id']: mutedTagIds } },
                        condition: mutedTagIds.length > 0,
                      },
                      {
                        query: { terms: { spaceId: mutedSpaceIds } },
                        condition: mutedSpaceIds.length > 0,
                      },
                      {
                        query: {
                          ids: { values: viewedPostIds },
                        },
                        condition: viewedPostIds.length > 0,
                      },
                    ]),
                    should: makeQueryContainers([
                      {
                        query: { rank_feature: { field: 'reputation' } },
                      },
                      {
                        query: { terms: { ['tags.id']: followingTagIds } },
                        condition: followingTagIds.length > 0,
                      },
                      {
                        query: {
                          terms: {
                            ['tags.id']: viewedTagIds,
                            boost: 0.2,
                          },
                        },
                        condition: viewedTagIds.length > 0,
                      },
                      {
                        query: { term: { hasThumbnail: true } },
                      },
                    ]),
                    filter: [{ terms: { ageRating: allowedAgeRating } }],
                  },
                },
                functions: [
                  {
                    random_score: { seed: Math.floor(Math.random() * 1000), field: '_seq_no' },
                  },
                  {
                    exp: {
                      publishedAt: {
                        scale: '30d',
                        offset: '7d',
                      },
                    },
                  },
                ],
              },
            },

            size: 6,
          });
        } else {
          return elasticSearch.search({
            index: indexName('posts'),
            query: {
              function_score: {
                query: {
                  bool: {
                    should: [{ rank_feature: { field: 'reputation', boost: 2 } }],
                    filter: [{ term: { ageRating: 'ALL' } }],
                  },
                },
                functions: [
                  {
                    random_score: { seed: Math.floor(Math.random() * 1000), field: '_seq_no' },
                  },
                  {
                    exp: {
                      publishedAt: {
                        scale: '30d',
                        offset: '7d',
                      },
                    },
                  },
                ],
              },
            },

            size: 6,
          });
        }
      })();

      return await database
        .select({ Posts })
        .from(Posts)
        .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
        .where(
          and(
            inArray(Posts.id, searchResultToIds(searchResult)),
            eq(Posts.state, 'PUBLISHED'),
            eq(Posts.visibility, 'PUBLIC'),
            eq(Spaces.state, 'ACTIVE'),
            eq(Spaces.visibility, 'PUBLIC'),
          ),
        )
        .then((rows) => rows.map((row) => row.Posts));
    },
  }),

  recommendedTags: t.field({
    type: [Tag],
    resolve: async (_, __, context) => {
      if (context.session) {
        const [mutedTagIds, followingTagIds, recentlyViewedTagIds] = await Promise.all([
          getMutedTagIds({ userId: context.session.userId }),
          database
            .select({ tagId: TagFollows.tagId })
            .from(TagFollows)
            .where(eq(TagFollows.userId, context.session.userId))
            .then((rows) => rows.map((row) => row.tagId)),
          database
            .select({ tagId: PostTags.tagId })
            .from(PostViews)
            .innerJoin(PostTags, eq(PostTags.postId, PostViews.postId))
            .where(and(eq(PostViews.userId, context.session.userId), ne(PostTags.kind, 'TRIGGER')))
            .orderBy(desc(PostViews.viewedAt))
            .limit(100)
            .then((rows) => rows.map((row) => row.tagId)),
        ]);

        const searchResult = await elasticSearch.search({
          index: indexName('tags'),
          query: {
            function_score: {
              query: {
                bool: {
                  should: makeQueryContainers([
                    { query: { rank_feature: { field: 'usageCount.TITLE' } } },
                    {
                      query: { ids: { values: recentlyViewedTagIds } },
                      condition: recentlyViewedTagIds.length > 0,
                    },
                  ]),
                  must_not: makeQueryContainers([
                    {
                      query: { ids: { values: mutedTagIds } },
                      condition: mutedTagIds.length > 0,
                    },
                    {
                      query: { ids: { values: followingTagIds } },
                      condition: followingTagIds.length > 0,
                    },
                  ]),
                },
              },

              functions: [
                {
                  random_score: { seed: Math.floor(Math.random() * 1000), field: '_seq_no' },
                },
              ],
            },
          },

          size: 20,
        });

        return searchResultToIds(searchResult);
      } else {
        const searchResult = await elasticSearch.search({
          index: indexName('tags'),
          query: {
            function_score: {
              query: {
                bool: {
                  should: [{ rank_feature: { field: 'usageCount.TITLE' } }],
                },
              },
              functions: [
                {
                  random_score: { seed: Math.floor(Math.random() * 1000), field: '_seq_no' },
                },
              ],
            },
          },

          size: 20,
        });

        return searchResultToIds(searchResult);
      }
    },
  }),

  featuredTagFeed: t.field({
    type: [FeaturedTag],
    resolve: async (_, __, context) => {
      const mutedTagIds = context.session ? await getMutedTagIds({ userId: context.session.userId }) : [];
      const tags = await useCache(
        'featuredTagFeed',
        async () => {
          return database
            .select({ tagId: PostTags.tagId })
            .from(PostTags)
            .innerJoin(Posts, eq(Posts.id, PostTags.postId))
            .where(
              and(inArray(PostTags.kind, ['CHARACTER', 'TITLE']), gt(PostTags.createdAt, dayjs().subtract(1, 'month'))),
            )
            .groupBy(PostTags.tagId)
            .orderBy(desc(countDistinct(Posts.userId)))
            .limit(20)
            .then((rows) => rows.map((row) => row.tagId));
        },
        60 * 60,
      );

      return R.shuffle(R.sift(tags.map((tagId) => (mutedTagIds.includes(tagId) ? null : { tagId })))).slice(0, 5);
    },
  }),

  followingFeed: t.field({
    type: [Post],
    args: {
      page: t.arg.int({ defaultValue: 1 }),
      take: t.arg.int({ defaultValue: 30 }),
    },
    resolve: async (_, { page, take }, context) => {
      if (!context.session) {
        return [];
      }

      const [mutedTagIds, mutedSpaceIds, followingSpaceIds, followingTagIds] = await Promise.all([
        getMutedTagIds({ userId: context.session.userId }),
        getMutedSpaceIds({ userId: context.session.userId }),
        database
          .select({ spaceId: SpaceFollows.spaceId })
          .from(SpaceFollows)
          .where(eq(SpaceFollows.userId, context.session.userId))
          .then((rows) => rows.map((row) => row.spaceId)),
        database
          .select({ tagId: TagFollows.tagId })
          .from(TagFollows)
          .where(eq(TagFollows.userId, context.session.userId))
          .then((rows) => rows.map((row) => row.tagId)),
      ]);

      if (followingSpaceIds.length === 0 && followingTagIds.length === 0) {
        return [];
      }

      const searchResult = await elasticSearch.search({
        index: indexName('posts'),
        query: {
          bool: {
            filter: {
              bool: {
                should: makeQueryContainers([
                  {
                    query: { terms: { ['tags.id']: followingTagIds } },
                    condition: followingTagIds.length > 0,
                  },
                  {
                    query: { terms: { 'space.id': followingSpaceIds } },
                    condition: followingSpaceIds.length > 0,
                  },
                ]),
              },
            },
            must_not: makeQueryContainers([
              {
                query: { terms: { ['tags.id']: mutedTagIds } },
                condition: mutedTagIds.length > 0,
              },
              {
                query: { terms: { 'space.id': mutedSpaceIds } },
                condition: mutedSpaceIds.length > 0,
              },
            ]),
          },
        },

        sort: [{ publishedAt: 'desc' }],
        from: (page - 1) * take,
        size: take,
      });

      return searchResultToIds(searchResult);
    },
  }),

  collectionFeed: t.field({
    type: [SpaceCollection],
    resolve: async (_, __, context) => {
      const mutedSpaceIds = await getMutedSpaceIds({ userId: context.session?.userId });

      const searchResult = await elasticSearch.search({
        index: indexName('collections'),
        query: {
          function_score: {
            query: {
              bool: {
                must_not: makeQueryContainers([
                  {
                    query: { terms: { spaceId: mutedSpaceIds } },
                    condition: mutedSpaceIds.length > 0,
                  },
                ]),
                should: [{ rank_feature: { field: 'reputation', boost: 5 } }, { term: { hasThumbnail: true } }],
              },
            },

            functions: [
              {
                random_score: { seed: Math.floor(Math.random() * 1000), field: '_seq_no' },
              },
              {
                exp: {
                  lastPostPublishedAt: {
                    scale: '30d',
                    offset: '7d',
                  },
                },
              },
            ],
          },
        },

        size: 10,
      });

      return searchResultToIds(searchResult);
    },
  }),

  curatedPosts: t.field({
    type: [Post],
    resolve: async (_, __, context) => {
      return R.shuffle(
        await database
          .select({ postId: CurationPosts.postId })
          .from(CurationPosts)
          .innerJoin(Posts, eq(CurationPosts.postId, Posts.id))
          .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
          .where(
            and(
              eq(Posts.state, 'PUBLISHED'),
              eq(Posts.visibility, 'PUBLIC'),
              eq(Spaces.visibility, 'PUBLIC'),
              context.session
                ? notExists(
                    database
                      .select({ id: PostTags.id })
                      .from(PostTags)
                      .innerJoin(UserTagMutes, eq(UserTagMutes.tagId, PostTags.tagId))
                      .where(and(eq(PostTags.postId, Posts.id), eq(UserTagMutes.userId, context.session.userId))),
                  )
                : undefined,
              context.session
                ? notInArray(
                    Posts.spaceId,
                    database
                      .select({ spaceId: UserSpaceMutes.spaceId })
                      .from(UserSpaceMutes)
                      .where(eq(UserSpaceMutes.userId, context.session.userId)),
                  )
                : undefined,
            ),
          )
          .then((rows) => rows.map((row) => row.postId)),
      ).slice(0, 10);
    },
  }),

  recentFeed: t.field({
    type: [Post],
    resolve: async () => {
      return [];
    },
  }),

  spaceFeed: t.withAuth({ user: true }).field({
    type: [Post],
    resolve: async () => {
      return [];
    },
  }),

  recentlyUsedTags: t.field({
    type: [Tag],
    resolve: async () => {
      return [];
    },
  }),
}));
