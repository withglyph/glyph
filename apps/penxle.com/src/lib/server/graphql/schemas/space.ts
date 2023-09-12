import { SpaceMemberRole } from '@prisma/client';
import { FormValidationError, NotFoundError } from '$lib/errors';
import { createId } from '$lib/utils';
import { CreateSpaceInputSchema } from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Space', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    slug: t.exposeString('slug'),
    name: t.exposeString('name'),
    members: t.relation('members'),

    meAsMember: t.prismaField({
      type: 'SpaceMember',
      nullable: true,
      resolve: async (query, space, __, { db, ...context }) => {
        if (!context.session) {
          return null;
        }

        return await db.spaceMember.findUnique({
          ...query,
          where: {
            spaceId_userId: {
              spaceId: space.id,
              userId: context.session.userId,
            },
          },
        });
      },
    }),
  }),
});

builder.prismaObject('SpaceMember', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    role: t.expose('role', { type: SpaceMemberRole }),
    space: t.relation('space'),
    profile: t.relation('profile'),
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
    spaceId: t.id(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  space: t.prismaField({
    type: 'Space',
    args: { slug: t.arg.string() },
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
  createSpace: t.withAuth({ auth: true }).prismaField({
    type: 'Space',
    args: { input: t.arg({ type: CreateSpaceInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const isSlugUsed = await db.space.exists({
        where: { slug: input.slug, state: 'ACTIVE' },
      });

      if (isSlugUsed) {
        throw new FormValidationError('slug', '이미 사용중인 URL이에요.');
      }

      const user = await db.user.findUniqueOrThrow({
        select: { profileId: true },
        where: { id: context.session.userId },
      });

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
              userId: context.session.userId,
              profileId: user.profileId,
              role: 'OWNER',
            },
          },
        },
      });
    },
  }),

  deleteSpace: t.withAuth({ auth: true }).prismaField({
    type: 'Space',
    args: { input: t.arg({ type: DeleteSpaceInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return await db.space.update({
        ...query,
        where: {
          id: input.spaceId,
          state: 'ACTIVE',
          members: {
            some: { userId: context.session.userId, role: 'OWNER' },
          },
        },
        data: { state: 'INACTIVE' },
      });
    },
  }),
}));
