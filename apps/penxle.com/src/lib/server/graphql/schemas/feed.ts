import dayjs from 'dayjs';
import { builder } from '../builder';

/**
 * * Queries
 */

builder.queryFields((t) => ({
  recommendFeed: t.withAuth({ user: true }).prismaField({
    type: ['Post'],
    args: { dateBefore: t.arg.string({ required: false }) },
    resolve: async (query, _, input, { db, ...context }) => {
      const dateBefore = input.dateBefore ? dayjs(input.dateBefore) : undefined;

      return db.post.findMany({
        ...query,
        orderBy: { publishedAt: 'desc' },
        where: {
          state: 'PUBLISHED',
          createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
          visibility: 'PUBLIC',
          password: null,
          space: {
            state: 'ACTIVE',
            userMutes: {
              none: { userId: context.session.userId },
            },
          },
          publishedRevision: {
            tags: {
              none: {
                tag: {
                  userMutes: { some: { userId: context.session.userId } },
                },
              },
            },
          },
          OR: [
            {
              space: {
                followers: {
                  some: { userId: context.session.userId },
                },
              },
            },
            {
              publishedRevision: {
                tags: {
                  some: {
                    tag: {
                      followers: {
                        some: { userId: context.session.userId },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      });
    },
  }),

  tagFeed: t.withAuth({ user: true }).prismaField({
    type: ['Post'],
    args: { dateBefore: t.arg.string({ required: false }) },
    resolve: async (query, _, input, { db, ...context }) => {
      const dateBefore = input.dateBefore ? dayjs(input.dateBefore) : undefined;

      return db.post.findMany({
        ...query,
        orderBy: { publishedAt: 'desc' },
        where: {
          state: 'PUBLISHED',
          createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
          visibility: 'PUBLIC',
          password: null,
          publishedRevision: {
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
          },
          space: {
            state: 'ACTIVE',
            userMutes: {
              none: { userId: context.session.userId },
            },
          },
        },
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
        orderBy: { publishedAt: 'desc' },
        where: {
          state: 'PUBLISHED',
          createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
          visibility: 'PUBLIC',
          password: null,
          publishedRevision: {
            tags: {
              none: {
                tag: {
                  userMutes: { some: { userId: context.session.userId } },
                },
              },
            },
          },
          space: {
            state: 'ACTIVE',
            userMutes: {
              none: { userId: context.session.userId },
            },
            followers: {
              some: { userId: context.session.userId },
            },
          },
        },
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
        },

        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    },
  }),

  recentlyUsedTags: t.prismaField({
    type: ['Tag'],
    resolve: async (query, _, __, { db, ...context }) => {
      const postTags = await db.postRevisionTag.findMany({
        select: { tag: query },
        where: {
          tag: context.session
            ? {
                userMutes: { none: { userId: context.session.userId } },
              }
            : undefined,
          revision: { kind: 'PUBLISHED' },
        },

        distinct: ['tagId'],
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return postTags.map(({ tag }) => tag);
    },
  }),

  recentlyPurchasedPosts: t.prismaField({
    type: ['Post'],
    resolve: async (query, _, __, { db, ...context }) => {
      const postPurchases = await db.postPurchase.findMany({
        select: { post: query },
        where: {
          post: {
            state: 'PUBLISHED',
            visibility: 'PUBLIC',
            password: null,
            publishedRevision: {
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
            space: {
              state: 'ACTIVE',
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
        select: { space: query },
        where: {
          state: 'PUBLISHED',
          visibility: 'PUBLIC',
          password: null,
          publishedRevision: {
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
          space: {
            state: 'ACTIVE',
            userMutes: context.session
              ? {
                  none: { userId: context.session.userId },
                }
              : undefined,
          },
        },

        take: 5,
        distinct: ['spaceId'],
        orderBy: { publishedAt: 'desc' },
      });

      return posts.map(({ space }) => space);
    },
  }),
}));
