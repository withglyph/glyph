import { FormValidationError, NotFoundError } from '$lib/errors';
import { db } from '$lib/server/database';
import { createId } from '$lib/utils';
import { CreateSpaceInputSchema, SpaceSlugSchema } from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Space', {
  select: true,
  fields: (t) => ({
    id: t.exposeString('id'),
    slug: t.exposeString('slug'),
    name: t.exposeString('name'),
  }),
});

builder.prismaObject('SpaceMember', {
  select: true,
  fields: (t) => ({
    id: t.exposeString('id'),
    space: t.relation('space'),
    profile: t.relation('profile'),
  }),
});

/**
 * * Inputs
 */

const CreateSpaceInput = builder.inputType('CreateSpaceInput', {
  fields: (t) => ({
    name: t.string(),
    slug: t.string(),
  }),
  validate: { schema: CreateSpaceInputSchema },
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  space: t.prismaField({
    type: 'Space',
    args: { slug: t.arg.string({ validate: { schema: SpaceSlugSchema } }) },
    resolve: async (query, _, args) => {
      const space = await db.space.findUnique({
        ...query,
        where: { slug: args.slug },
      });

      if (space) {
        return space;
      } else {
        throw new NotFoundError();
      }
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createSpace: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Space',
    args: { input: t.arg({ type: CreateSpaceInput }) },
    resolve: async (query, _, { input }, context) => {
      const existingSpace = await db.space.findUnique({
        select: { state: true },
        where: { slug: input.slug },
      });

      if (existingSpace?.state === 'ACTIVE') {
        throw new FormValidationError('slug', '이미 사용중인 URL이에요.');
      }

      return await db.space.create({
        ...query,
        data: {
          id: createId(),
          name: input.name,
          slug: input.slug,
          state: 'ACTIVE',
          members: {
            create: {
              id: createId(),
              profileId: context.session.profileId,
            },
          },
        },
      });
    },
  }),
}));
