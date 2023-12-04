import dayjs from 'dayjs';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Tag', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    wiki: t.relation('wiki', { nullable: true }),

    parents: t.prismaField({
      type: ['Tag'],
      select: (_, __, nestedSelection) => ({
        parents: {
          select: { parentTag: nestedSelection() },
        },
      }),
      resolve: (_, { parents }) => parents.map(({ parentTag }) => parentTag),
    }),

    posts: t.prismaField({
      type: ['Post'],
      args: { dateBefore: t.arg.string({ required: false }) },
      select: (input, context, nestedSelection) => {
        const dateBefore = input.dateBefore ? dayjs(input.dateBefore).toDate() : undefined;
        return {
          posts: {
            select: { post: nestedSelection() },
            where: {
              post: {
                createdAt: dateBefore ? { lt: dateBefore } : undefined,
                option: { visibility: 'PUBLIC', password: null },
                space: {
                  state: 'ACTIVE',
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
                          userMutes: {
                            some: { userId: context.session.userId },
                          },
                        },
                      },
                    }
                  : undefined,
              },
            },
            orderBy: { post: { createdAt: 'desc' } },
          },
        };
      },

      resolve: (_, { posts }) => posts.map(({ post }) => post),
    }),
  }),
});

builder.prismaObject('TagWiki', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    lastRevision: t.prismaField({
      type: 'TagWikiRevision',
      select: (_, __, nestedSelection) => ({
        revisions: nestedSelection({
          orderBy: { createdAt: 'desc' },
          take: 1,
        }),
      }),

      resolve: (_, { revisions }) => revisions[0],
    }),
  }),
});

builder.prismaObject('TagWikiRevision', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    content: t.exposeString('content'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

builder.prismaObject('PostTag', {
  fields: (t) => ({
    id: t.exposeID('id'),
    tag: t.relation('tag'),
    pinned: t.exposeBoolean('pinned'),
  }),
});

/**
 * * Inputs
 */

const MuteTagInput = builder.inputType('MuteTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

const UnmuteTagInput = builder.inputType('UnmuteTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

const FollowTagInput = builder.inputType('FollowTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

const UnfollowTagInput = builder.inputType('UnfollowTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

const SetParentTagInput = builder.inputType('SetParentTagInput', {
  fields: (t) => ({
    tagId: t.id(),
    parentTagId: t.id(),
  }),
});

const UnsetParentTagInput = builder.inputType('UnsetParentTagInput', {
  fields: (t) => ({
    tagId: t.id(),
    parentTagId: t.id(),
  }),
});

const ReviseTagWikiInput = builder.inputType('ReviseTagWikiInput', {
  fields: (t) => ({
    tagId: t.id(),
    content: t.string(),
  }),
});

// const SetPostTagsInput = builder.inputType('SetPostTagsInput', {
//   fields: (t) => ({
//     postId: t.id(),
//     tag: t.stringList(),
//   }),
// });

/**
 * * Queries
 */

builder.queryFields((t) => ({
  tag: t.prismaField({
    type: 'Tag',
    args: { name: t.arg.string() },
    resolve: (query, _, { name }, { db }) => {
      return db.tag.findUniqueOrThrow({ ...query, where: { name } });
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  muteTag: t.withAuth({ user: true }).prismaField({
    type: 'Tag',
    args: { input: t.arg({ type: MuteTagInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const tag = await db.tag.findUniqueOrThrow({
        ...query,
        where: { id: input.tagId },
      });

      await db.userTagMute.upsert({
        where: {
          userId_tagId: {
            userId: context.session.userId,
            tagId: input.tagId,
          },
        },
        create: {
          id: createId(),
          userId: context.session.userId,
          tagId: input.tagId,
        },
        update: {},
      });

      return tag;
    },
  }),

  unmuteTag: t.withAuth({ user: true }).prismaField({
    type: 'Tag',
    args: { input: t.arg({ type: UnmuteTagInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const tag = await db.tag.findUniqueOrThrow({
        ...query,
        where: { id: input.tagId },
      });

      await db.userTagMute.deleteMany({
        where: {
          userId: context.session.userId,
          tagId: input.tagId,
        },
      });

      return tag;
    },
  }),

  followTag: t.withAuth({ user: true }).prismaField({
    type: 'Tag',
    args: { input: t.arg({ type: FollowTagInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      await db.tagFollow.upsert({
        where: {
          userId_tagId: {
            userId: context.session.userId,
            tagId: input.tagId,
          },
        },
        create: {
          id: createId(),
          userId: context.session.userId,
          tagId: input.tagId,
        },
        update: {},
      });

      return db.tag.findUniqueOrThrow({
        ...query,
        where: { id: input.tagId },
      });
    },
  }),

  unfollowTag: t.withAuth({ user: true }).prismaField({
    type: 'Tag',
    args: { input: t.arg({ type: UnfollowTagInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      await db.tagFollow.deleteMany({
        where: {
          userId: context.session.userId,
          tagId: input.tagId,
        },
      });

      return db.tag.findUniqueOrThrow({
        ...query,
        where: { id: input.tagId },
      });
    },
  }),

  setParentTag: t.withAuth({ user: true }).prismaField({
    type: 'Tag',
    args: { input: t.arg({ type: SetParentTagInput }) },
    resolve: async (query, _, { input }, { db }) => {
      return await db.tag.update({
        ...query,
        where: { id: input.tagId },
        data: {
          parents: {
            connect: { id: input.parentTagId },
          },
        },
      });
    },
  }),

  unsetParentTag: t.withAuth({ user: true }).prismaField({
    type: 'Tag',
    args: { input: t.arg({ type: UnsetParentTagInput }) },
    resolve: async (query, _, { input }, { db }) => {
      return await db.tag.update({
        ...query,
        where: { id: input.tagId },
        data: {
          parents: {
            disconnect: { id: input.parentTagId },
          },
        },
      });
    },
  }),

  reviseTagWiki: t.withAuth({ user: true }).prismaField({
    type: 'TagWiki',
    args: { input: t.arg({ type: ReviseTagWikiInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const revisionData = {
        id: createId(),
        content: input.content,
        createdAt: new Date(),
        userId: context.session.userId,
      };

      return await db.tagWiki.upsert({
        ...query,
        where: { tagId: input.tagId },
        create: {
          id: createId(),
          tagId: input.tagId,
          revisions: { create: revisionData },
        },
        update: {
          revisions: { create: revisionData },
        },
      });
    },
  }),

  // setPostTags: t.withAuth({ user: true }).prismaField({
  //   type: 'Tag',
  //   args: { input: t.arg({ type: SetPostTagsInput }) },
  //   resolve: async (query, _, { input }, { db, ...context }) => {
  //     const post = await db.post.findUniqueOrThrow({
  //       where: { id: input.postId },
  //     });
  //     const tag = await db.tag.upsert({

  //     })
  //   },
  // }),
}));
