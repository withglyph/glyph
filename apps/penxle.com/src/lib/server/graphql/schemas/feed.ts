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
        orderBy: { createdAt: 'desc' },
        where: {
          state: 'PUBLISHED',
          createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
          option: { visibility: 'PUBLIC', password: null },
          space: {
            state: 'ACTIVE',
            userMutes: {
              none: { userId: context.session.userId },
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
          ],
          tags: {
            none: {
              tag: {
                userMutes: { some: { userId: context.session.userId } },
              },
            },
          },
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
        orderBy: { createdAt: 'desc' },
        where: {
          state: 'PUBLISHED',
          createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
          option: { visibility: 'PUBLIC', password: null },
          space: {
            state: 'ACTIVE',
            userMutes: {
              none: { userId: context.session.userId },
            },
          },
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
        orderBy: { createdAt: 'desc' },
        where: {
          state: 'PUBLISHED',
          createdAt: dateBefore?.isValid() ? { lt: dateBefore.toDate() } : undefined,
          option: { visibility: 'PUBLIC', password: null },
          space: {
            state: 'ACTIVE',
            userMutes: {
              none: { userId: context.session.userId },
            },
            followers: {
              some: { userId: context.session.userId },
            },
          },
          tags: {
            none: {
              tag: {
                userMutes: { some: { userId: context.session.userId } },
              },
            },
          },
        },
      });
    },
  }),
}));
