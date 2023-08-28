import { PermissionDeniedError } from '$lib/errors';
import { createId } from '$lib/utils';
import { CreatePostInputSchema } from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Post', {
  fields: (t) => ({
    id: t.exposeID('id'),
    space: t.relation('space'),
    title: t.exposeString('title'),
    subtitle: t.exposeString('subtitle', { nullable: true }),
    content: t.exposeString('content'),
    views: t.exposeInt('views'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});

/**
 * * Inputs
 */

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: (t) => ({
    title: t.string(),
    subtitle: t.string({ required: false }),
    content: t.string(),
    spaceId: t.string(),
  }),
  validate: {
    schema: CreatePostInputSchema,
  },
});

/**
 * * Queries
 */

// builder.queryFields((t) => ({
//   post: t.prismaField({
//     type: 'Post',
//     args: { id: t.arg.id() },
//     resolve: async (query, _, args, { db }) => {
//       return await db.post.findMany({
//         ...query,
//         where: { id: args.id }
//       });
//     },
//   }),
// }));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createPost: t.withAuth({ auth: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: CreatePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const space = await db.space.findFirst({
        include: { members: true },
        where: {
          id: input.spaceId,
          members: {
            some: { userId: context.session.userId },
          },
        },
      });
      if (!space) {
        throw new PermissionDeniedError();
      }

      const post = await db.post.create({
        ...query,
        data: {
          id: createId(),
          spaceId: input.spaceId,
          userId: context.session.userId,
          title: input.title,
          subtitle: input.subtitle,
          content: input.content,
        },
      });

      context.track('post:create');

      return post;
    },
  }),
}));
