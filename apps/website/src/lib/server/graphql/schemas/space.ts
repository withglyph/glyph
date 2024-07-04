import dayjs from 'dayjs';
import { and, count, desc, eq, isNotNull, isNull, ne, notExists } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { PostPriceCategory, PostVisibility, SpaceMemberRole, SpaceVisibility } from '$lib/enums';
import { FormValidationError, IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { redis } from '$lib/server/cache';
import {
  database,
  inArray,
  notInArray,
  PostRevisions,
  Posts,
  PostTags,
  Profiles,
  RedeemCodeGroups,
  SpaceCollectionPosts,
  SpaceCollections,
  SpaceFollows,
  SpaceMasquerades,
  SpaceMembers,
  Spaces,
  Users,
  UserSpaceMutes,
  UserTagMutes,
} from '$lib/server/database';
import { enqueueJob } from '$lib/server/jobs';
import {
  createRandomIcon,
  directUploadImage,
  getSpaceMember,
  makeMasquerade,
  useFirstRow,
  useFirstRowOrThrow,
} from '$lib/server/utils';
import { CreateSpaceSchema, SetSpaceSchema, UpdateSpaceSchema } from '$lib/validations';
import { builder } from '../builder';
import { createObjectRef } from '../utils';
import { SpaceCollection } from './collection';
import { Image } from './image';
import { Post } from './post';
import { RedeemCodeGroup } from './redeem';
import { Profile } from './user';

/**
 * * Types
 */

export const Space = createObjectRef('Space', Spaces);

Space.implement({
  roleGranter: {
    view: async (space, context) => {
      return space.visibility === 'PUBLIC' || !!(await getSpaceMember(context, space.id));
    },

    member: async (space, context) => {
      return !!(await getSpaceMember(context, space.id));
    },

    admin: async (space, context) => {
      const meAsMember = await getSpaceMember(context, space.id);

      return meAsMember?.role === 'ADMIN';
    },
  },

  fields: (t) => ({
    id: t.exposeID('id'),
    slug: t.exposeString('slug'),
    name: t.exposeString('name'),
    description: t.exposeString('description', { nullable: true }),
    visibility: t.expose('visibility', { type: SpaceVisibility }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    icon: t.field({
      type: Image,
      resolve: (space) => space.iconId,
    }),

    followed: t.boolean({
      resolve: async (space, _, context) => {
        if (!context.session) {
          return false;
        }

        const follows = await database
          .select({ id: SpaceFollows.id })
          .from(SpaceFollows)
          .where(and(eq(SpaceFollows.userId, context.session.userId), eq(SpaceFollows.spaceId, space.id)));

        return follows.length > 0;
      },
    }),

    muted: t.boolean({
      resolve: async (space, _, context) => {
        if (!context.session) {
          return false;
        }

        const mutes = await database
          .select({ id: UserSpaceMutes.id })
          .from(UserSpaceMutes)
          .where(and(eq(UserSpaceMutes.userId, context.session.userId), eq(UserSpaceMutes.spaceId, space.id)));

        return mutes.length > 0;
      },
    }),

    meAsMember: t.field({
      type: SpaceMember,
      nullable: true,
      resolve: async (space, _, context) => {
        if (!context.session) {
          return null;
        }

        const members = await database
          .select({ id: SpaceMembers.id })
          .from(SpaceMembers)
          .where(
            and(
              eq(SpaceMembers.spaceId, space.id),
              eq(SpaceMembers.userId, context.session.userId),
              eq(SpaceMembers.state, 'ACTIVE'),
            ),
          );

        if (members.length === 0) {
          return null;
        }

        return members[0].id;
      },
    }),

    members: t.field({
      type: [SpaceMember],
      scopes: 'view',
      resolve: async (space) => {
        const members = await database
          .select()
          .from(SpaceMembers)
          .where(and(eq(SpaceMembers.spaceId, space.id), eq(SpaceMembers.state, 'ACTIVE')));

        return members;
      },

      scopeError: () => [],
    }),

    posts: t.field({
      type: [Post],
      scopes: 'view',
      args: {
        mine: t.arg.boolean({ defaultValue: false }),
        visibility: t.arg({ type: PostVisibility, required: false }),
        collectionId: t.arg.id({ required: false }),
        anyCollection: t.arg.boolean({ required: false }),
        priceCategory: t.arg({ type: PostPriceCategory, required: false }),
      },
      resolve: async (space, args, context) => {
        const meAsMember = await getSpaceMember(context, space.id);
        if (args.mine && !meAsMember) {
          throw new PermissionDeniedError();
        }

        // 한 포스트가 한 컬렉션에만 들어갈 수 있는 구조를 가정하고 구현, 만약 여러 컬렉션에 들어갈 수 있다면 수정 필요

        const posts = await database
          .select({ id: Posts.id })
          .from(Posts)
          .innerJoin(PostRevisions, eq(PostRevisions.id, Posts.publishedRevisionId))
          .leftJoin(SpaceCollectionPosts, eq(SpaceCollectionPosts.postId, Posts.id))
          .where(
            and(
              eq(Posts.spaceId, space.id),
              eq(Posts.state, 'PUBLISHED'),
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              args.mine ? eq(Posts.userId, meAsMember!.userId) : undefined,
              args.visibility ? eq(Posts.visibility, args.visibility) : undefined,
              args.priceCategory === 'FREE' ? isNull(PostRevisions.price) : undefined,
              args.priceCategory === 'PAID' ? isNotNull(PostRevisions.price) : undefined,
              args.collectionId ? eq(SpaceCollectionPosts.collectionId, args.collectionId) : undefined,
              args.anyCollection === true ? isNotNull(SpaceCollectionPosts.collectionId) : undefined,
              args.anyCollection === false ? isNull(SpaceCollectionPosts.collectionId) : undefined,
              meAsMember ? undefined : eq(Posts.visibility, 'PUBLIC'),
              context.session && !meAsMember
                ? notExists(
                    database
                      .select({ id: PostTags.id })
                      .from(PostTags)
                      .innerJoin(UserTagMutes, eq(UserTagMutes.tagId, PostTags.tagId))
                      .where(and(eq(PostTags.postId, Posts.id), eq(UserTagMutes.userId, context.session.userId))),
                  )
                : undefined,
            ),
          )
          .orderBy(desc(Posts.publishedAt));

        return posts.map((post) => post.id);
      },

      scopeError: () => [],
    }),

    collections: t.field({
      type: [SpaceCollection],
      scopes: 'view',
      resolve: async (space) => {
        const collections = await database
          .select({ id: SpaceCollections.id })
          .from(SpaceCollections)
          .where(and(eq(SpaceCollections.spaceId, space.id), eq(SpaceCollections.state, 'ACTIVE')))
          .orderBy(desc(SpaceCollections.createdAt));

        return collections.map((collection) => collection.id);
      },

      scopeError: () => [],
    }),

    postCount: t.int({
      resolve: async (space, _, context) => {
        const meAsMember = await getSpaceMember(context, space.id);

        const [{ value }] = await database
          .select({ value: count() })
          .from(Posts)
          .where(
            and(
              eq(Posts.spaceId, space.id),
              eq(Posts.state, 'PUBLISHED'),
              meAsMember ? undefined : eq(Posts.visibility, 'PUBLIC'),
            ),
          );

        return value;
      },
    }),

    followerCount: t.int({
      resolve: async (space) => {
        const [{ value }] = await database
          .select({ value: count() })
          .from(SpaceFollows)
          .innerJoin(Users, eq(Users.id, SpaceFollows.userId))
          .where(and(eq(SpaceFollows.spaceId, space.id), eq(Users.state, 'ACTIVE')));

        return value;
      },
    }),

    myMasquerade: t.field({
      type: SpaceMasquerade,
      nullable: true,
      resolve: async (space, _, context) => {
        if (!context.session) {
          return null;
        }

        const masquerades = await database
          .select({ id: SpaceMasquerades.id })
          .from(SpaceMasquerades)
          .where(and(eq(SpaceMasquerades.spaceId, space.id), eq(SpaceMasquerades.userId, context.session.userId)));

        if (masquerades.length === 0) {
          return null;
        }

        return masquerades[0].id;
      },
    }),

    blockedMasquerades: t.field({
      type: [SpaceMasquerade],
      scopes: 'admin',
      grantScopes: ['$spaceMasquerade:spaceAdmin'],
      resolve: async (space) => {
        const masquerades = await database
          .select({ id: SpaceMasquerades.id })
          .from(SpaceMasquerades)
          .where(and(eq(SpaceMasquerades.spaceId, space.id), isNotNull(SpaceMasquerades.blockedAt)));

        return masquerades.map((masquerade) => masquerade.id);
      },
    }),

    commentProfile: t.field({
      type: Profile,
      nullable: true,
      resolve: async (space, _, context) => {
        if (!context.session) {
          return null;
        }

        const meAsMember = await getSpaceMember(context, space.id);

        if (meAsMember) {
          return meAsMember.profileId;
        }

        const masquerade = await makeMasquerade({
          spaceId: space.id,
          userId: context.session.userId,
        });

        return masquerade.blockedAt ? null : masquerade.profileId;
      },
    }),

    redeemCodeGroups: t.field({
      type: [RedeemCodeGroup],
      scopes: 'member',
      resolve: async (space) => {
        return [
          ...(await database
            .select()
            .from(RedeemCodeGroups)
            .where(and(eq(RedeemCodeGroups.spaceId, space.id), eq(RedeemCodeGroups.state, 'ACTIVE')))),
          ...(await database
            .select()
            .from(RedeemCodeGroups)
            .where(and(eq(RedeemCodeGroups.spaceId, space.id), eq(RedeemCodeGroups.state, 'INACTIVE')))),
        ];
      },
    }),
  }),
});

export const SpaceMember = createObjectRef('SpaceMember', SpaceMembers);
SpaceMember.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    role: t.expose('role', { type: SpaceMemberRole }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    profile: t.field({
      type: Profile,
      resolve: (member) => member.profileId,
    }),
  }),
});

export const SpaceMasquerade = createObjectRef('SpaceMasquerade', SpaceMasquerades);
SpaceMasquerade.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    blockedAt: t.expose('blockedAt', {
      type: 'DateTime',
      authScopes: { $granted: '$spaceMasquerade:spaceAdmin' },
      nullable: true,
    }),

    profile: t.field({
      type: Profile,
      resolve: (masquerade) => masquerade.profileId,
    }),

    blocked: t.boolean({
      resolve: (masquerade) => !!masquerade.blockedAt,
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
    name: t.string({ required: false }),
    slug: t.string({ required: false }),
    iconId: t.id({ required: false }),
    description: t.string({ required: false }),
    isPublic: t.boolean({ required: false }),
  }),
  validate: { schema: UpdateSpaceSchema },
});

const SetSpaceInput = builder.inputType('SetSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
    name: t.string(),
    slug: t.string(),
    iconId: t.id(),
    description: t.string({ required: false }),
    isPublic: t.boolean(),
    profileName: t.string(),
    profileAvatarId: t.id(),
  }),
  validate: { schema: SetSpaceSchema },
});

const UpdateSpaceProfileInput = builder.inputType('UpdateSpaceProfileInput', {
  fields: (t) => ({
    spaceId: t.id(),
    profileName: t.string(),
    profileAvatarId: t.id(),
  }),
});

const DeleteSpaceProfileInput = builder.inputType('DeleteSpaceProfileInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const FollowSpaceInput = builder.inputType('FollowSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const UnfollowSpaceInput = builder.inputType('UnfollowSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const MuteSpaceInput = builder.inputType('MuteSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const UnmuteSpaceInput = builder.inputType('UnmuteSpaceInput', {
  fields: (t) => ({
    spaceId: t.id(),
  }),
});

const BlockMasqueradeInput = builder.inputType('BlockMasqueradeInput', {
  fields: (t) => ({
    spaceId: t.id(),
    masqueradeId: t.id(),
  }),
});

const UnblockMasqueradeInput = builder.inputType('UnblockMasqueradeInput', {
  fields: (t) => ({
    spaceId: t.id(),
    masqueradeId: t.id(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  space: t.field({
    type: Space,
    args: { slug: t.arg.string() },
    resolve: async (_, args) => {
      const space = await database
        .select({ id: Spaces.id, visibility: Spaces.visibility })
        .from(Spaces)
        .where(and(eq(Spaces.slug, args.slug), eq(Spaces.state, 'ACTIVE')))
        .then(useFirstRowOrThrow(new NotFoundError()));

      return space.id;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: CreateSpaceInput }) },
    resolve: async (_, { input }, context) => {
      const slugUsages = await database
        .select({ id: Spaces.id })
        .from(Spaces)
        .where(and(eq(Spaces.slug, input.slug), eq(Spaces.state, 'ACTIVE')));

      if (slugUsages.length > 0) {
        throw new FormValidationError('slug', '이미 사용중인 URL이에요.');
      }

      return await database.transaction(async (tx) => {
        let profileId: string;

        if (input.profileName && input.profileAvatarId) {
          const [profile] = await tx
            .insert(Profiles)
            .values({ name: input.profileName, avatarId: input.profileAvatarId })
            .returning({ id: Profiles.id });

          profileId = profile.id;
        } else {
          const users = await database
            .select({ profileId: Users.profileId })
            .from(Users)
            .where(eq(Users.id, context.session.userId));

          profileId = users[0].profileId;
        }

        let iconId = input.iconId;
        if (!iconId) {
          iconId = await directUploadImage({
            userId: context.session.userId,
            name: 'icon',
            source: await createRandomIcon(),
          });
        }

        const [space] = await tx
          .insert(Spaces)
          .values({
            name: input.name,
            slug: input.slug,
            state: 'ACTIVE',
            visibility: input.isPublic ? 'PUBLIC' : 'PRIVATE',
            iconId,
          })
          .returning({ id: Spaces.id });

        await tx.insert(SpaceMembers).values({
          spaceId: space.id,
          userId: context.session.userId,
          profileId,
          role: 'ADMIN',
          state: 'ACTIVE',
        });

        return space.id;
      });
    },
  }),

  deleteSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: DeleteSpaceInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);

      if (meAsMember?.role !== 'ADMIN') {
        throw new PermissionDeniedError();
      }

      await database.transaction(async (tx) => {
        await tx
          .update(SpaceMembers)
          .set({ state: 'INACTIVE' })
          .where(and(eq(SpaceMembers.spaceId, input.spaceId), eq(SpaceMembers.state, 'ACTIVE')));

        const postIds$ = database
          .select({ id: Posts.id })
          .from(Posts)
          .where(and(eq(Posts.spaceId, input.spaceId), eq(Posts.state, 'PUBLISHED')));

        await tx
          .update(PostRevisions)
          .set({ kind: 'ARCHIVED' })
          .where(and(eq(PostRevisions.kind, 'PUBLISHED'), inArray(PostRevisions.postId, postIds$)));

        await tx.update(Posts).set({ state: 'DELETED' }).where(inArray(Posts.id, postIds$));

        await tx
          .update(Posts)
          .set({ spaceId: null, memberId: null })
          .where(and(eq(Posts.spaceId, input.spaceId), inArray(Posts.state, ['DRAFT', 'EPHEMERAL'])));

        await tx.update(Spaces).set({ state: 'INACTIVE' }).where(eq(Spaces.id, input.spaceId));
      });

      await enqueueJob('indexAllPostsInSpace', input.spaceId);

      return input.spaceId;
    },
  }),

  updateSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: UpdateSpaceInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);

      if (meAsMember?.role !== 'ADMIN') {
        throw new PermissionDeniedError();
      }

      if (input.slug) {
        const slugUsages = await database
          .select({ id: Spaces.id })
          .from(Spaces)
          .where(and(eq(Spaces.slug, input.slug), eq(Spaces.state, 'ACTIVE'), ne(Spaces.id, input.spaceId)));

        if (slugUsages.length > 0) {
          throw new IntentionalError('이미 사용중인 URL이에요.');
        }
      }

      await database
        .update(Spaces)
        .set({
          name: input.name ?? undefined,
          slug: input.slug ?? undefined,
          iconId: input.iconId ?? undefined,
          description: input.description ?? undefined,
          visibility: match(input.isPublic)
            .with(true, () => 'PUBLIC' as const)
            .with(false, () => 'PRIVATE' as const)
            .otherwise(() => undefined),
        })
        .where(eq(Spaces.id, input.spaceId));

      if (input.isPublic === false) {
        await database.delete(SpaceFollows).where(
          and(
            eq(SpaceFollows.spaceId, input.spaceId),
            notInArray(
              SpaceFollows.userId,
              database
                .select({ userId: SpaceMembers.userId })
                .from(SpaceMembers)
                .where(and(eq(SpaceMembers.spaceId, input.spaceId), eq(SpaceMembers.state, 'ACTIVE'))),
            ),
          ),
        );
      }

      await enqueueJob('indexAllPostsInSpace', input.spaceId);

      return input.spaceId;
    },
  }),

  setSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: SetSpaceInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);

      if (meAsMember?.role !== 'ADMIN') {
        throw new PermissionDeniedError();
      }

      if (input.slug) {
        const slugUsages = await database
          .select({ id: Spaces.id })
          .from(Spaces)
          .where(and(eq(Spaces.slug, input.slug), eq(Spaces.state, 'ACTIVE'), ne(Spaces.id, input.spaceId)));

        if (slugUsages.length > 0) {
          throw new IntentionalError('이미 사용중인 URL이에요.');
        }
      }

      await database.transaction(async (tx) => {
        await tx
          .update(Spaces)
          .set({
            name: input.name,
            slug: input.slug,
            iconId: input.iconId,
            description: input.description,
            visibility: match(input.isPublic)
              .with(true, () => 'PUBLIC' as const)
              .with(false, () => 'PRIVATE' as const)
              .exhaustive(),
          })
          .where(eq(Spaces.id, input.spaceId));

        if (input.isPublic === false) {
          await tx.delete(SpaceFollows).where(
            and(
              eq(SpaceFollows.spaceId, input.spaceId),
              notInArray(
                SpaceFollows.userId,
                tx
                  .select({ userId: SpaceMembers.userId })
                  .from(SpaceMembers)
                  .where(and(eq(SpaceMembers.spaceId, input.spaceId), eq(SpaceMembers.state, 'ACTIVE'))),
              ),
            ),
          );
        }

        if (meAsMember.profileId === context.session.profileId) {
          const [profile] = await tx
            .insert(Profiles)
            .values({
              name: input.profileName,
              avatarId: input.profileAvatarId,
            })
            .returning({ id: Profiles.id });

          await tx.update(SpaceMembers).set({ profileId: profile.id }).where(eq(SpaceMembers.id, meAsMember.id));
        } else {
          await tx
            .update(Profiles)
            .set({ name: input.profileName, avatarId: input.profileAvatarId })
            .where(eq(Profiles.id, meAsMember.profileId));
        }
      });

      await enqueueJob('indexAllPostsInSpace', input.spaceId);

      return input.spaceId;
    },
  }),

  updateSpaceProfile: t.withAuth({ user: true }).field({
    type: SpaceMember,
    args: { input: t.arg({ type: UpdateSpaceProfileInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);

      if (!meAsMember) {
        throw new PermissionDeniedError();
      }

      await database.transaction(async (tx) => {
        if (meAsMember.profileId === context.session.profileId) {
          const [profile] = await tx
            .insert(Profiles)
            .values({
              name: input.profileName,
              avatarId: input.profileAvatarId,
            })
            .returning({ id: Profiles.id });

          await tx.update(SpaceMembers).set({ profileId: profile.id }).where(eq(SpaceMembers.id, meAsMember.id));
        } else {
          await tx
            .update(Profiles)
            .set({ name: input.profileName, avatarId: input.profileAvatarId })
            .where(eq(Profiles.id, meAsMember.profileId));
        }
      });

      return meAsMember.id;
    },
  }),

  deleteSpaceProfile: t.withAuth({ user: true }).field({
    type: SpaceMember,
    args: { input: t.arg({ type: DeleteSpaceProfileInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);

      if (!meAsMember) {
        throw new PermissionDeniedError();
      }

      await database
        .update(SpaceMembers)
        .set({ profileId: context.session.profileId })
        .where(eq(SpaceMembers.id, meAsMember.id));

      return meAsMember.id;
    },
  }),

  followSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: FollowSpaceInput }) },
    resolve: async (_, { input }, context) => {
      const spaces = await database
        .select({ id: Spaces.id, visibility: Spaces.visibility })
        .from(Spaces)
        .where(and(eq(Spaces.id, input.spaceId), eq(Spaces.state, 'ACTIVE')));

      if (spaces.length === 0) {
        throw new NotFoundError();
      }

      if (spaces[0].visibility === 'PRIVATE') {
        const meAsMember = await getSpaceMember(context, input.spaceId);

        if (!meAsMember) {
          throw new PermissionDeniedError();
        }
      }

      await database
        .insert(SpaceFollows)
        .values({ userId: context.session.userId, spaceId: input.spaceId })
        .onConflictDoNothing();

      const masquerade = await makeMasquerade({
        spaceId: input.spaceId,
        userId: context.session.userId,
      });

      const members = await database
        .select({ userId: SpaceMembers.userId })
        .from(SpaceMembers)
        .where(and(eq(SpaceMembers.spaceId, input.spaceId), eq(SpaceMembers.state, 'ACTIVE')));

      await Promise.all(
        members.map((member) =>
          enqueueJob('createNotification', {
            userId: member.userId,
            category: 'SUBSCRIBE',
            actorId: masquerade.profileId,
            data: { spaceId: input.spaceId },
            origin: context.event.url.origin,
          }),
        ),
      );

      return input.spaceId;
    },
  }),

  unfollowSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: UnfollowSpaceInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .delete(SpaceFollows)
        .where(and(eq(SpaceFollows.userId, context.session.userId), eq(SpaceFollows.spaceId, input.spaceId)));

      return input.spaceId;
    },
  }),

  muteSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: MuteSpaceInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .insert(UserSpaceMutes)
        .values({ userId: context.session.userId, spaceId: input.spaceId })
        .onConflictDoNothing();

      await redis.del(`mutedSpaceIds:${context.session.userId}`);

      return input.spaceId;
    },
  }),

  unmuteSpace: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: UnmuteSpaceInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .delete(UserSpaceMutes)
        .where(and(eq(UserSpaceMutes.userId, context.session.userId), eq(UserSpaceMutes.spaceId, input.spaceId)));

      await redis.del(`mutedSpaceIds:${context.session.userId}`);

      return input.spaceId;
    },
  }),

  blockMasquerade: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: BlockMasqueradeInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);

      if (meAsMember?.role !== 'ADMIN') {
        throw new PermissionDeniedError();
      }

      const blockedUserId = await database
        .update(SpaceMasquerades)
        .set({ blockedAt: dayjs() })
        .where(and(eq(SpaceMasquerades.id, input.masqueradeId), eq(SpaceMasquerades.spaceId, input.spaceId)))
        .returning({ userId: SpaceMasquerades.userId })
        .then(useFirstRow)
        .then((row) => row?.userId);

      if (blockedUserId) {
        await database
          .delete(SpaceFollows)
          .where(and(eq(SpaceFollows.userId, blockedUserId), eq(SpaceFollows.spaceId, input.spaceId)));
      }

      return input.spaceId;
    },
  }),

  unblockMasquerade: t.withAuth({ user: true }).field({
    type: Space,
    args: { input: t.arg({ type: UnblockMasqueradeInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);

      if (meAsMember?.role !== 'ADMIN') {
        throw new PermissionDeniedError();
      }

      await database
        .update(SpaceMasquerades)
        .set({ blockedAt: null })
        .where(and(eq(SpaceMasquerades.id, input.masqueradeId), eq(SpaceMasquerades.spaceId, input.spaceId)));

      return input.spaceId;
    },
  }),
}));
