import { SpaceMemberInvitationState, SpaceMemberRole } from '@prisma/client';
import * as R from 'radash';
import { FormValidationError, IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { createRandomIcon, directUploadImage } from '$lib/server/utils';
import { createId } from '$lib/utils';
import {
  AcceptSpaceMemberInvitationSchema,
  CreateSpaceMemberInvitationSchema,
  CreateSpaceSchema,
  UpdateSpaceSchema,
} from '$lib/validations';
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
        state: 'ACTIVE',
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
    description: t.exposeString('description', { nullable: true }),
    icon: t.relation('icon'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    members: t.relation('members', {
      query: { where: { state: 'ACTIVE' } },
    }),

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
            state: 'ACTIVE',
          },
        });
      },
    }),

    invitations: t.relation('invitations', {
      authScopes: { $granted: '$space:admin' },
      // @ts-expect-error pothos-prisma가 unauthorizedResolver 리턴값 타입 추론을 잘못하는듯
      unauthorizedResolver: () => [],
      grantScopes: ['$space.member.invitation'],
    }),

    posts: t.prismaField({
      type: ['Post'],
      resolve: async (query, space, _, { db, ...context }) => {
        const meAsMember = context.session
          ? await db.spaceMember.findUnique({
              where: {
                spaceId_userId: {
                  spaceId: space.id,
                  userId: context.session.userId,
                },
              },
            })
          : null;

        return await db.post.findMany({
          ...query,
          where: {
            spaceId: space.id,
            state: 'PUBLISHED',
            option: {
              visibility: meAsMember ? undefined : 'PUBLIC',
            },
          },
        });
      },
    }),
  }),
});

builder.prismaObject('SpaceMember', {
  select: { id: true, spaceId: true },
  grantScopes: async (member, { db, ...context }) => {
    if (!context.session) {
      return [];
    }
    const meAsMember = await db.spaceMember.findUnique({
      select: { role: true },
      where: {
        spaceId_userId: {
          spaceId: member.spaceId,
          userId: context.session.userId,
        },
        state: 'ACTIVE',
      },
    });

    if (!meAsMember) {
      return [];
    }

    return R.sift(['$space:member', meAsMember.role === 'ADMIN' && '$space:admin']);
  },
  fields: (t) => ({
    id: t.exposeID('id'),
    role: t.expose('role', { type: SpaceMemberRole }),
    profile: t.relation('profile'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    email: t.field({
      type: 'String',
      authScopes: { $granted: '$space:member' },
      select: { userId: true },
      resolve: async (member, _, { db }) => {
        const user = await db.user.findUniqueOrThrow({
          select: { email: true },
          where: { id: member.userId },
        });
        return user?.email;
      },
    }),
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
    respondedAt: t.expose('respondedAt', {
      type: 'DateTime',
      nullable: true,
    }),
  }),
});

/**
 * * Inputs
 */

const CreateSpaceInput = builder.inputType('CreateSpaceInput', {
  fields: (t) => ({
    name: t.string(),
    slug: t.string(),
    iconId: t.id({ required: false }),
    profileName: t.string({ required: false }),
    profileAvatarId: t.id({ required: false }),
    isPublic: t.boolean({ defaultValue: true }),
  }),
  validate: { schema: CreateSpaceSchema },
});

const DeleteSpaceInput = builder.inputType('DeleteSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const UpdateSpaceInput = builder.inputType('UpdateSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
    name: t.string(),
    slug: t.string(),
    iconId: t.id(),
    description: t.string({ required: false }),
  }),
  validate: { schema: UpdateSpaceSchema },
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
    profileName: t.string({ required: false }),
    profileAvatarId: t.id({ required: false }),
  }),
  validate: { schema: AcceptSpaceMemberInvitationSchema },
});

const IgnoreSpaceMemberInvitationInput = builder.inputType('IgnoreSpaceMemberInvitationInput', {
  fields: (t) => ({
    invitationId: t.id(),
  }),
});

const LeaveSpaceInput = builder.inputType('LeaveSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const RemoveSpaceMemberInput = builder.inputType('RemoveSpaceMemberInput', {
  fields: (t) => ({
    spaceMemberId: t.id(),
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

      let profileId: string;
      if (input.profileName && input.profileAvatarId) {
        const profile = await db.profile.create({
          data: {
            id: createId(),
            name: input.profileName,
            avatarId: input.profileAvatarId,
          },
        });

        profileId = profile.id;
      } else {
        const user = await db.user.findUniqueOrThrow({
          select: { profileId: true },
          where: { id: context.session.userId },
        });
        profileId = user.profileId;
      }

      let iconId = input.iconId;
      if (!iconId) {
        iconId = await directUploadImage({
          db,
          userId: context.session.userId,
          name: 'icon',
          source: await createRandomIcon(),
        });
      }

      return await db.space.create({
        ...query,
        data: {
          id: createId(),
          name: input.name,
          slug: input.slug,
          state: 'ACTIVE',
          visibility: 'PUBLIC',
          iconId,
          members: {
            create: {
              id: createId(),
              userId: context.session.userId,
              profileId,
              role: 'ADMIN',
              state: 'ACTIVE',
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
          state: 'ACTIVE',
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
            state: 'ACTIVE',
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

  updateSpace: t.withAuth({ user: true }).prismaField({
    type: 'Space',
    grantScopes: ['$space:admin'],
    args: { input: t.arg({ type: UpdateSpaceInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const meAsMember = await db.spaceMember.exists({
        where: {
          spaceId: input.spaceId,
          userId: context.session.userId,
          state: 'ACTIVE',
          role: 'ADMIN',
        },
      });
      if (!meAsMember) {
        throw new PermissionDeniedError();
      }

      return db.space.update({
        ...query,
        where: {
          id: input.spaceId,
          state: 'ACTIVE',
        },
        data: {
          name: input.name,
          slug: input.slug,
          iconId: input.iconId,
          description: input.description,
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
      if (input.profileName && input.profileAvatarId) {
        const profile = await db.profile.create({
          data: {
            id: createId(),
            name: input.profileName,
            avatarId: input.profileAvatarId,
          },
        });

        profileId = profile.id;
      } else {
        profileId = user.profile.id;
      }

      await db.spaceMember.upsert({
        where: {
          spaceId_userId: {
            spaceId: invitation.spaceId,
            userId: context.session.userId,
          },
        },
        create: {
          id: createId(),
          spaceId: invitation.spaceId,
          userId: context.session.userId,
          profileId,
          role: invitation.role,
          state: 'ACTIVE',
        },
        update: {
          profileId,
          role: invitation.role,
          state: 'ACTIVE',
        },
      });

      return await db.spaceMemberInvitation.update({
        ...query,
        where: { id: invitation.id },
        data: {
          state: 'ACCEPTED',
          respondedAt: new Date(),
        },
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

  leaveSpace: t.withAuth({ user: true }).prismaField({
    type: 'SpaceMember',
    args: { input: t.arg({ type: LeaveSpaceInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const meAsMember = await db.spaceMember.findUniqueOrThrow({
        select: { id: true, role: true },
        where: {
          spaceId_userId: {
            spaceId: input.spaceId,
            userId: context.session.userId,
          },
          state: 'ACTIVE',
        },
      });

      if (meAsMember.role === 'ADMIN') {
        const adminCount = await db.spaceMember.count({
          where: {
            spaceId: input.spaceId,
            role: 'ADMIN',
            state: 'ACTIVE',
          },
        });

        if (adminCount <= 1) {
          throw new IntentionalError('마지막 관리자는 스페이스를 나갈 수 없어요.');
        }
      }

      return await db.spaceMember.update({
        ...query,
        where: {
          id: meAsMember.id,
        },
        data: {
          state: 'INACTIVE',
        },
      });
    },
  }),

  removeSpaceMember: t.withAuth({ user: true }).prismaField({
    type: 'SpaceMember',
    nullable: true,
    args: { input: t.arg({ type: RemoveSpaceMemberInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const kickedMember = await db.spaceMember.findUniqueOrThrow({
        select: { id: true, spaceId: true },
        where: {
          id: input.spaceMemberId,
          state: 'ACTIVE',
        },
      });

      const meAsMember = await db.spaceMember.findUniqueOrThrow({
        select: { id: true },
        where: {
          spaceId_userId: {
            spaceId: kickedMember.spaceId,
            userId: context.session.userId,
          },
          role: 'ADMIN',
          state: 'ACTIVE',
        },
      });

      if (meAsMember.id === kickedMember.id) {
        throw new IntentionalError('자기 자신을 추방할 수 없어요.');
      }

      return await db.spaceMember.update({
        ...query,
        where: {
          id: kickedMember.id,
        },
        data: {
          state: 'INACTIVE',
        },
      });
    },
  }),
}));
