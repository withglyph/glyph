import dayjs from 'dayjs';
import * as R from 'radash';
import { elasticSearch, indexName } from '$lib/server/search';
import {
  getMutedSpaceIds,
  getMutedTagIds,
  isAdulthood,
  isGte15,
  makeQueryContainers,
  searchResultToPrismaData,
} from '$lib/server/utils';
import { defineSchema } from '../builder';

export const feedSchema = defineSchema((builder) => {
  /**
   * * Queries
   */

  builder.queryFields((t) => ({
    recommendFeed: t.prismaField({
      type: ['Post'],
      resolve: async (query, _, __, { db, ...context }) => {
        const searchResult = await (async () => {
          if (context.session) {
            const [mutedTagIds, mutedSpaceIds, followingTagIds, viewedPosts, userBirthday] = await Promise.all([
              getMutedTagIds({ db, userId: context.session.userId }),
              getMutedSpaceIds({ db, userId: context.session.userId }),
              db.tagFollow
                .findMany({
                  select: { tagId: true },
                  where: { userId: context.session.userId },
                })
                .then((tagFollows) => tagFollows.map(({ tagId }) => tagId)),
              db.postView
                .findMany({
                  select: {
                    post: {
                      select: {
                        id: true,
                        tags: {
                          select: { tagId: true },
                        },
                      },
                    },
                  },
                  where: { userId: context.session.userId },
                  orderBy: { viewedAt: 'desc' },
                  take: 50,
                })
                .then((postViews) => postViews.map(({ post }) => post)),
              db.userPersonalIdentity
                .findUnique({ where: { userId: context.session.userId } })
                .then((user) => user?.birthday),
            ]);

            const viewedPostIds = viewedPosts.map(({ id }) => id);
            const viewedTagIds = [
              ...new Set<string>(viewedPosts.flatMap(({ tags }) => tags.map(({ tagId }) => tagId))),
            ];

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
                        },
                      ]),
                      should: makeQueryContainers([
                        {
                          query: { rank_feature: { field: 'trendingScore' } },
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

              size: 50,
            });
          } else {
            return elasticSearch.search({
              index: indexName('posts'),
              query: {
                function_score: {
                  query: {
                    bool: {
                      should: [{ rank_feature: { field: 'trendingScore', boost: 2 } }],
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

              size: 50,
            });
          }
        })();

        return searchResultToPrismaData({
          searchResult,
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

    recentFeed: t.prismaField({
      type: ['Post'],
      resolve: async (query, _, __, { db, ...context }) => {
        const posts = await db.post.findMany({
          ...query,
          where: {
            state: 'PUBLISHED',
            visibility: 'PUBLIC',
            password: null,
            space: {
              state: 'ACTIVE',
              visibility: 'PUBLIC',
              userMutes: context.session
                ? {
                    none: { userId: context.session.userId },
                  }
                : undefined,
            },
            tags: context.session
              ? {
                  none: {
                    tag: {
                      userMutes: { some: { userId: context.session.userId } },
                    },
                  },
                }
              : undefined,
          },

          orderBy: { publishedAt: 'desc' },
          take: 50,
        });

        return posts;
      },
    }),

    tagFeed: t.withAuth({ user: true }).prismaField({
      type: ['Post'],
      args: { dateBefore: t.arg.string({ required: false }) },
      resolve: async (query, _, input, { db, ...context }) => {
        const dateBefore = input.dateBefore ? dayjs(input.dateBefore) : undefined;

        return db.post.findMany({
          ...query,
          where: {
            state: 'PUBLISHED',
            createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
            visibility: 'PUBLIC',
            password: null,
            tags: {
              some: {
                tag: {
                  followers: {
                    some: { userId: context.session.userId },
                  },
                },
              },
              none: {
                tag: {
                  userMutes: { some: { userId: context.session.userId } },
                },
              },
            },
            space: {
              state: 'ACTIVE',
              visibility: 'PUBLIC',
              userMutes: {
                none: { userId: context.session.userId },
              },
            },
          },

          orderBy: { publishedAt: 'desc' },
          take: 20,
        });
      },
    }),

    spaceFeed: t.withAuth({ user: true }).prismaField({
      type: ['Post'],
      args: { dateBefore: t.arg.string({ required: false }) },
      resolve: async (query, _, input, { db, ...context }) => {
        const dateBefore = input.dateBefore ? dayjs(input.dateBefore) : undefined;

        return db.post.findMany({
          ...query,
          where: {
            state: 'PUBLISHED',
            createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
            visibility: 'PUBLIC',
            tags: {
              none: {
                tag: {
                  userMutes: { some: { userId: context.session.userId } },
                },
              },
            },
            space: {
              state: 'ACTIVE',
              visibility: 'PUBLIC',
              userMutes: {
                none: { userId: context.session.userId },
              },
              followers: {
                some: { userId: context.session.userId },
              },
            },
          },

          orderBy: { publishedAt: 'desc' },
          take: 50,
        });
      },
    }),

    recentlyCreatedTags: t.prismaField({
      type: ['Tag'],
      resolve: async (query, _, __, { db, ...context }) => {
        return db.tag.findMany({
          ...query,
          where: {
            userMutes: context.session ? { none: { userId: context.session.userId } } : undefined,
            posts: {
              some: {
                post: {
                  state: 'PUBLISHED',
                  visibility: 'PUBLIC',
                  password: null,
                  ageRating: 'ALL',
                  space: {
                    state: 'ACTIVE',
                    visibility: 'PUBLIC',
                    userMutes: context.session ? { none: { userId: context.session.userId } } : undefined,
                  },
                },
              },
            },
          },

          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      },
    }),

    recentlyUsedTags: t.prismaField({
      type: ['Tag'],
      resolve: async (query, _, __, { db, ...context }) => {
        const postTags = await db.postTag.findMany({
          include: { tag: query },
          where: {
            kind: { not: 'TRIGGER' },
            tag: context.session
              ? {
                  userMutes: { none: { userId: context.session.userId } },
                }
              : undefined,
            post: {
              state: 'PUBLISHED',
              visibility: 'PUBLIC',
              password: null,
              ageRating: 'ALL',
              space: {
                state: 'ACTIVE',
                visibility: 'PUBLIC',
                userMutes: context.session ? { none: { userId: context.session.userId } } : undefined,
              },
            },
          },

          distinct: ['tagId'],
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        return postTags.map(({ tag }) => tag);
      },
    }),

    recentlyPurchasedPosts: t.prismaField({
      type: ['Post'],
      resolve: async (query, _, __, { db, ...context }) => {
        const postPurchases = await db.postPurchase.findMany({
          include: { post: query },
          where: {
            post: {
              state: 'PUBLISHED',
              visibility: 'PUBLIC',
              password: null,
              tags: context.session
                ? {
                    none: {
                      tag: {
                        userMutes: { some: { userId: context.session.userId } },
                      },
                    },
                  }
                : undefined,
              space: {
                state: 'ACTIVE',
                visibility: 'PUBLIC',
                userMutes: context.session
                  ? {
                      none: { userId: context.session.userId },
                    }
                  : undefined,
              },
            },
          },

          distinct: ['postId'],
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        return postPurchases.map(({ post }) => post);
      },
    }),

    recentlyPublishedSpaces: t.prismaField({
      type: ['Space'],
      resolve: async (query, _, __, { db, ...context }) => {
        const posts = await db.post.findMany({
          include: { space: query },
          where: {
            state: 'PUBLISHED',
            visibility: 'PUBLIC',
            password: null,
            tags: context.session
              ? {
                  none: {
                    tag: {
                      userMutes: { some: { userId: context.session.userId } },
                    },
                  },
                }
              : undefined,
            space: {
              state: 'ACTIVE',
              visibility: 'PUBLIC',
              userMutes: context.session
                ? {
                    none: { userId: context.session.userId },
                  }
                : undefined,
            },
            ageRating: 'ALL',
          },

          take: 5,
          distinct: ['spaceId'],
          orderBy: { publishedAt: 'desc' },
        });

        // Where 조건에 의해 space가 null일 수 없음
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return posts.map(({ space }) => space!);
      },
    }),
  }));
});
