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
    members: t.relation('members'),
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

const DeleteSpaceInput = builder.inputType('DeleteSpaceInput', {
  fields: (t) => ({
    spaceId: t.string(),
  }),
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
        where: { slug: args.slug, state: 'ACTIVE' },
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
      const isSlugExists = await db.space.exists({
        where: { slug: input.slug, state: 'ACTIVE' },
      });

      if (isSlugExists) {
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

  deleteSpace: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Space',
    args: { input: t.arg({ type: DeleteSpaceInput }) },
    resolve: async (query, _, { input }, context) => {
      return await db.space.update({
        ...query,
        where: {
          id: input.spaceId,
          state: 'ACTIVE',
          members: { some: { profileId: context.session.profileId } },
        },
        data: { state: 'INACTIVE' },
      });
    },
  }),
}));
