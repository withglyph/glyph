import dayjs from 'dayjs';
import { defineSchema } from '../builder';

export const feedSchema = defineSchema((builder) => {
  /**
   * * Queries
   */

  builder.queryFields((t) => ({
    recommendFeed: t.prismaField({
      type: ['Post'],
      resolve: async (query, _, __, { db, ...context }) => {
        const posts = await db.post.findMany({
          ...query,
          where: {
            state: 'PUBLISHED',
            visibility: 'PUBLIC',
            password: null,
            ageRating: 'ALL',
            publishedAt: { gte: dayjs().subtract(3, 'day').toDate() },
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

          orderBy: [{ views: { _count: 'desc' } }, { publishedAt: 'desc' }],
          take: 50,
        });

        return posts;
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
