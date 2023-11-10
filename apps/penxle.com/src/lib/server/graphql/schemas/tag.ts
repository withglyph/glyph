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

// const SetPostTagsInput = builder.inputType('SetPostTagsInput', {
//   fields: (t) => ({
//     postId: t.id(),
//     tag: t.stringList(),
//   }),
// });

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
        where: { name: input.tagId },
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
