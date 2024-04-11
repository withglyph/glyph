import { and, desc, eq } from 'drizzle-orm';
import * as R from 'radash';
import {
  database,
  inArray,
  Posts,
  PostTags,
  PostViews,
  Spaces,
  TagFollows,
  UserPersonalIdentities,
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
import { Post } from './post';
import { Tag } from './tag';

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

  recentFeed: t.field({
    type: [Post],
    resolve: async () => {
      return [];
    },
  }),

  tagFeed: t.withAuth({ user: true }).field({
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
