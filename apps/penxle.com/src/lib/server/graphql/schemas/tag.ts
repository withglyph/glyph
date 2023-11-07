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

// const SetPostTagsInput = builder.inputType('SetPostTagsInput', {
//   fields: (t) => ({
//     postId: t.id(),
//     tag: t.stringList(),
//   }),
// });

/**
 * * Mutations
 */

// builder.mutationFields((t) => ({
//   setPostTags: t.withAuth({ user: true }).prismaField({
//     type: 'Tag',
//     args: { input: t.arg({ type: SetPostTagsInput }) },
//     resolve: async (query, _, { input }, { db, ...context }) => {
//       const post = await db.post.findUniqueOrThrow({
//         where: { id: input.postId },
//       });
//       const tag = await db.tag.upsert({

//       })
//     },
//   })
// }));
