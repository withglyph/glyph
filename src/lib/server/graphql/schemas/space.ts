import { SpaceMemberRole } from '@prisma/client';
import { FormValidationError, NotFoundError } from '$lib/errors';
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

    meAsMember: t.prismaField({
      type: 'SpaceMember',
      nullable: true,
      select: { id: true },
      resolve: async (query, space, __, { db, ...context }) => {
        if (!context.session) {
          return null;
        }

        return await db.spaceMember.findUnique({
          ...query,
          where: {
            spaceId_profileId: {
              spaceId: space.id,
              profileId: context.session.profileId,
            },
          },
        });
      },
    }),
  }),
});

builder.prismaObject('SpaceMember', {
  select: true,
  fields: (t) => ({
    id: t.exposeString('id'),
    role: t.expose('role', { type: SpaceMemberRole }),
    space: t.relation('space'),
    profile: t.relation('profile'),

    canPublish: t.boolean({
      resolve: () => {
        return true;
      },
    }),

    canAccessDashboard: t.boolean({
      select: { profileId: true },
      resolve: () => {
        return true;
      },
    }),

    canAdministrate: t.boolean({
      select: { role: true },
      resolve: (member) => {
        return member.role === 'OWNER';
      },
    }),
  }),
});

/**
 * * Enums
 */

builder.enumType(SpaceMemberRole, { name: 'SpaceMemberRole' });

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
    resolve: async (query, _, args, { db }) => {
      const space = await db.space.findFirst({
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
    resolve: async (query, _, { input }, { db, ...context }) => {
      const isSlugExists = await db.space.exists({
        where: { slug: input.slug, state: 'ACTIVE' },
      });

      if (isSlugExists) {
        throw new FormValidationError('slug', '이미 사용중인 URL이에요.');
      }

      const space = await db.space.create({
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
              role: 'OWNER',
            },
          },
        },
      });

      context.track('space:create');

      return space;
    },
  }),

  deleteSpace: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Space',
    args: { input: t.arg({ type: DeleteSpaceInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const space = await db.space.update({
        ...query,
        where: {
          id: input.spaceId,
          state: 'ACTIVE',
          members: {
            some: { profileId: context.session.profileId, role: 'OWNER' },
          },
        },
        data: { state: 'INACTIVE' },
      });

      context.track('space:delete');

      return space;
    },
  }),
}));
