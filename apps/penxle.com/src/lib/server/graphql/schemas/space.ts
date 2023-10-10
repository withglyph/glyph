import { SpaceMemberInvitationState, SpaceMemberRole } from '@prisma/client';
import * as R from 'radash';
import { FormValidationError, NotFoundError } from '$lib/errors';
import { createId } from '$lib/utils';
import { CreateSpaceMemberInvitationSchema, CreateSpaceSchema } from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Space', {
  select: { id: true },
  grantScopes: async (space, { db, ...context }) => {
    if (!context.session) {
      return [];
    }

    const member = await db.spaceMember.findUnique({
      select: { role: true },
      where: {
        spaceId_userId: {
          spaceId: space.id,
          userId: context.session.userId,
        },
      },
    });

    if (!member) {
      return [];
    }

    return R.sift(['$space:member', member.role === 'ADMIN' && '$space:admin']);
  },
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

    invitations: t.relation('invitations', {
      authScopes: { $granted: '$space:admin' },
      grantScopes: ['$space.member.invitation'],
    }),
  }),
});

builder.prismaObject('SpaceMember', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    role: t.expose('role', { type: SpaceMemberRole }),

    profile: t.relation('profile'),
  }),
});

builder.prismaObject('SpaceMemberInvitation', {
  select: { id: true },
  authScopes: { $granted: '$space.member.invitation' },
  fields: (t) => ({
    id: t.exposeID('id'),
    receivedEmail: t.exposeString('receivedEmail'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    state: t.field({
      type: SpaceMemberInvitationState,
      select: { state: true },
      authScopes: { $granted: '$space.member.invitation.state' },
      resolve: (invitation) => invitation.state,
      unauthorizedResolver: (invitation) =>
        ['PENDING', 'ACCEPTED'].includes(invitation.state) ? invitation.state : 'PENDING',
    }),
    space: t.relation('space'),
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
  validate: { schema: CreateSpaceSchema },
});

const DeleteSpaceInput = builder.inputType('DeleteSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const CreateSpaceMemberInvitationInput = builder.inputType('CreateSpaceMemberInvitationInput', {
  fields: (t) => ({
    spaceId: t.id(),
    email: t.string(),
    role: t.field({ type: SpaceMemberRole }),
  }),
  validate: { schema: CreateSpaceMemberInvitationSchema },
});

const AcceptSpaceMemberInvitationInput = builder.inputType('AcceptSpaceMemberInvitationInput', {
  fields: (t) => ({
    invitationId: t.id(),
    name: t.string({ required: false }),
    avatarId: t.id({ required: false }),
  }),
});

const IgnoreSpaceMemberInvitationInput = builder.inputType('IgnoreSpaceMemberInvitationInput', {
  fields: (t) => ({
    invitationId: t.id(),
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
  createSpace: t.withAuth({ user: true }).prismaField({
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
          visibility: 'PUBLIC',
          members: {
            create: {
              id: createId(),
              userId: context.session.userId,
              profileId: user.profileId,
              role: 'ADMIN',
            },
          },
        },
      });
    },
  }),

  deleteSpace: t.withAuth({ user: true }).prismaField({
    type: 'Space',
    args: { input: t.arg({ type: DeleteSpaceInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return await db.space.update({
        ...query,
        where: {
          id: input.spaceId,
          state: 'ACTIVE',
          members: { some: { userId: context.session.userId, role: 'ADMIN' } },
        },
        data: { state: 'INACTIVE' },
      });
    },
  }),

  createSpaceMemberInvitation: t.withAuth({ user: true }).prismaField({
    type: 'SpaceMemberInvitation',
    grantScopes: ['$space.member.invitation'],
    args: { input: t.arg({ type: CreateSpaceMemberInvitationInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const member = await db.spaceMember.findUniqueOrThrow({
        where: {
          spaceId_userId: {
            spaceId: input.spaceId,
            userId: context.session.userId,
          },
          role: 'ADMIN',
        },
      });

      const targetUser = await db.user.findFirst({
        where: { email: input.email.toLowerCase() },
      });

      if (targetUser) {
        const isAlreadyMember = await db.spaceMember.exists({
          where: {
            spaceId: input.spaceId,
            userId: targetUser.id,
          },
        });

        if (isAlreadyMember) {
          throw new FormValidationError('email', '이미 스페이스에 가입한 사용자에요.');
        }
      }

      const isAlreadyInvited = await db.spaceMemberInvitation.exists({
        where: {
          spaceId: input.spaceId,
          receivedEmail: input.email.toLowerCase(),
          state: { not: 'ACCEPTED' },
        },
      });

      if (isAlreadyInvited) {
        throw new FormValidationError('email', '이미 초대한 사용자에요.');
      }

      return await db.spaceMemberInvitation.create({
        ...query,
        data: {
          id: createId(),
          spaceId: input.spaceId,
          sentUserId: member.userId,
          receivedUserId: targetUser?.id,
          receivedEmail: input.email.toLowerCase(),
          role: input.role,
          state: 'PENDING',
        },
      });
    },
  }),

  acceptSpaceMemberInvitation: t.withAuth({ user: true }).prismaField({
    type: 'SpaceMemberInvitation',
    grantScopes: ['$space.member.invitation'],
    args: { input: t.arg({ type: AcceptSpaceMemberInvitationInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const invitation = await db.spaceMemberInvitation.findUniqueOrThrow({
        include: { space: true },
        where: {
          id: input.invitationId,
          receivedUserId: context.session.userId,
          state: { not: 'ACCEPTED' },
        },
      });

      const user = await db.user.findUniqueOrThrow({
        select: { profile: true },
        where: { id: context.session.userId },
      });

      let profileId: string;
      if (input.name && input.avatarId) {
        const profile = await db.profile.create({
          data: {
            id: createId(),
            name: input.name,
            avatarId: input.avatarId,
          },
        });

        profileId = profile.id;
      } else {
        profileId = user.profile.id;
      }

      await db.spaceMember.create({
        data: {
          id: createId(),
          spaceId: invitation.spaceId,
          userId: context.session.userId,
          profileId,
          role: invitation.role,
        },
      });

      return await db.spaceMemberInvitation.update({
        ...query,
        where: { id: invitation.id },
        data: { state: 'ACCEPTED' },
      });
    },
  }),

  ignoreSpaceMemberInvitation: t.withAuth({ user: true }).prismaField({
    type: 'SpaceMemberInvitation',
    grantScopes: ['$space.member.invitation'],
    args: { input: t.arg({ type: IgnoreSpaceMemberInvitationInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return await db.spaceMemberInvitation.update({
        ...query,
        where: {
          id: input.invitationId,
          receivedUserId: context.session.userId,
          state: { not: 'ACCEPTED' },
        },
        data: { state: 'IGNORED' },
      });
    },
  }),
}));
