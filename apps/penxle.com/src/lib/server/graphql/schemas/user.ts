import crypto from 'node:crypto';
import {
  ContentFilterAction,
  ContentFilterCategory,
  PostState,
  SpaceMemberInvitationState,
  UserEmailVerificationKind,
  UserNotificationCategory,
  UserNotificationMethod,
  UserSingleSignOnProvider,
  UserState,
} from '@prisma/client';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import qs from 'query-string';
import { random } from 'radash';
import { match } from 'ts-pattern';
import { env } from '$env/dynamic/private';
import { IntentionalError, PermissionDeniedError } from '$lib/errors';
import { sendEmail } from '$lib/server/email';
import { LoginUser, UpdateUserEmail } from '$lib/server/email/templates';
import { AuthScope, UserSingleSignOnAuthorizationType } from '$lib/server/enums';
import { google, naver } from '$lib/server/external-api';
import {
  createAccessToken,
  createRandomAvatar,
  directUploadImage,
  getUserPoint,
  getUserRevenue,
  isAdulthood,
} from '$lib/server/utils';
import { createId } from '$lib/utils';
import {
  CreateUserSchema,
  DeleteUserSchema,
  IssueUserEmailAuthorizationUrlSchema,
  LoginUserSchema,
  UpdateUserEmailSchema,
  UpdateUserProfileSchema,
} from '$lib/validations';
import { defineSchema } from '../builder';

export const userSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('Profile', {
    fields: (t) => ({
      id: t.exposeID('id'),
      name: t.exposeString('name'),

      avatar: t.relation('avatar'),
    }),
  });

  builder.prismaObject('ProvisionedUser', {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      id: t.exposeID('id'),
      email: t.exposeString('email'),
      name: t.exposeString('name', { nullable: true }),
      avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    }),
  });

  builder.prismaObject('User', {
    authScopes: (user, context) => user.id === context.session?.userId || { $granted: '$user', staff: true },
    fields: (t) => ({
      id: t.exposeID('id'),
      email: t.exposeString('email'),
      state: t.expose('state', { type: UserState }),

      contentFilterPreferences: t.relation('contentFilterPreferences', { grantScopes: ['$user'] }),
      marketingConsent: t.relation('marketingConsent', { nullable: true, grantScopes: ['$user'] }),
      notificationPreferences: t.relation('notificationPreferences', { grantScopes: ['$user'] }),
      personalIdentity: t.relation('personalIdentity', { nullable: true, grantScopes: ['$user'] }),
      profile: t.relation('profile'),
      singleSignOns: t.relation('singleSignOns', { grantScopes: ['$user'] }),
      bookmarks: t.relation('bookmarks'),

      isAdulthood: t.boolean({
        select: { personalIdentity: { select: { birthday: true } } },
        resolve: (user) => {
          if (!user.personalIdentity) {
            return false;
          }

          return isAdulthood(user.personalIdentity.birthday);
        },
      }),

      point: t.int({
        resolve: async (user, _, { db }) => {
          return getUserPoint({ db, userId: user.id });
        },
      }),

      points: t.relation('pointTransactions', {
        query: {
          orderBy: { createdAt: 'desc' },
        },
      }),

      channelIOMemberHash: t.string({
        resolve: (user) => {
          return crypto
            .createHmac('sha256', Buffer.from(env.PRIVATE_CHANNEL_IO_SECRET_KEY, 'hex'))
            .update(user.id)
            .digest('hex');
        },
      }),

      spaces: t.prismaField({
        type: ['Space'],
        select: (_, __, nestedSelection) => ({
          spaces: {
            include: { space: nestedSelection() },
            where: {
              state: 'ACTIVE',
              space: { state: 'ACTIVE' },
            },
          },
        }),
        resolve: (_, { spaces }) => spaces.map(({ space }) => space),
      }),

      followedSpaces: t.prismaField({
        type: ['Space'],
        select: (_, __, nestedSelection) => ({
          followedSpaces: {
            include: { space: nestedSelection() },
            where: {
              space: { state: 'ACTIVE' },
            },
          },
        }),
        resolve: (_, { followedSpaces }) => followedSpaces.map(({ space }) => space),
      }),

      receivedSpaceMemberInvitations: t.relation('receivedSpaceMemberInvitations', {
        grantScopes: ['$space.member.invitation', '$space.member.invitation.state'],
        args: { state: t.arg({ type: SpaceMemberInvitationState, required: false }) },
        query: ({ state }) => ({ where: { state: state ?? undefined } }),
      }),

      mutedSpaces: t.prismaField({
        type: ['Space'],
        select: (_, __, nestedSelection) => ({
          mutedSpaces: {
            include: { space: nestedSelection() },
            where: {
              space: { state: 'ACTIVE' },
            },
          },
        }),
        resolve: (_, { mutedSpaces }) => mutedSpaces.map(({ space }) => space),
      }),

      mutedTags: t.prismaField({
        type: ['Tag'],
        select: (_, __, nestedSelection) => ({
          tagMutes: {
            include: { tag: nestedSelection() },
          },
        }),
        resolve: (_, { tagMutes }) => tagMutes.map(({ tag }) => tag),
      }),

      recentlyViewedPosts: t.prismaField({
        type: ['Post'],
        resolve: async (query, user, _, { db }) => {
          const postView = await db.postView.findMany({
            include: { post: query },
            where: {
              userId: user.id,
              post: {
                state: 'PUBLISHED',
                space: {
                  state: 'ACTIVE',
                  OR: [{ visibility: 'PUBLIC' }, { visibility: 'PRIVATE', members: { some: { userId: user.id } } }],
                },
                OR: [
                  { visibility: 'PUBLIC' },
                  { visibility: 'UNLISTED' },
                  {
                    visibility: 'SPACE',
                    space: { members: { some: { userId: user.id } } },
                  },
                ],
              },
            },
            orderBy: { createdAt: 'desc' },
          });
          return postView.map(({ post }) => post);
        },
      }),

      posts: t.relation('posts', {
        args: { state: t.arg({ type: PostState, defaultValue: 'PUBLISHED' }) },
        query: ({ state }) => ({
          where: { state },
          orderBy: { createdAt: 'desc' },
        }),
      }),

      likedPosts: t.prismaField({
        type: ['Post'],
        resolve: async (query, user, _, { db }) => {
          const likes = await db.postLike.findMany({
            include: { post: query },
            where: {
              userId: user.id,
              post: {
                state: 'PUBLISHED',
                space: {
                  state: 'ACTIVE',
                  OR: [{ visibility: 'PUBLIC' }, { visibility: 'PRIVATE', members: { some: { userId: user.id } } }],
                },
                OR: [
                  { visibility: 'PUBLIC' },
                  { visibility: 'UNLISTED' },
                  {
                    visibility: 'SPACE',
                    space: { members: { some: { userId: user.id } } },
                  },
                ],
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          return likes.map(({ post }) => post);
        },
      }),

      purchasedPosts: t.prismaField({
        type: ['Post'],
        select: (_, __, nestedSelection) => ({
          postPurchases: {
            include: { post: nestedSelection() },
            orderBy: { createdAt: 'desc' },
          },
        }),
        resolve: (_, { postPurchases }) => postPurchases.map(({ post }) => post),
      }),

      followedTags: t.prismaField({
        type: ['Tag'],
        select: (_, __, nestedSelection) => ({
          followedTags: {
            include: { tag: nestedSelection() },
          },
        }),

        resolve: (_, { followedTags }) => followedTags.map(({ tag }) => tag),
      }),

      revenue: t.field({
        type: 'Int',
        resolve: async (user, _, { db }) => {
          return getUserRevenue({ db, userId: user.id });
        },
      }),

      revenues: t.relation('revenues', {
        query: {
          orderBy: { createdAt: 'desc' },
        },
      }),
    }),
  });

  builder.prismaObject('UserContentFilterPreference', {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      id: t.exposeID('id'),
      category: t.expose('category', { type: ContentFilterCategory }),
      action: t.expose('action', { type: ContentFilterAction }),
    }),
  });

  builder.prismaObject('UserEmailVerification', {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      id: t.exposeID('id'),
      kind: t.expose('kind', { type: UserEmailVerificationKind }),
      email: t.exposeString('email'),
      expiresAt: t.expose('expiresAt', { type: 'DateTime' }),
    }),
  });

  builder.prismaObject('UserMarketingConsent', {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      id: t.exposeID('id'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
    }),
  });

  builder.prismaObject('UserNotificationPreference', {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      id: t.exposeID('id'),
      category: t.expose('category', { type: UserNotificationCategory }),
      method: t.expose('method', { type: UserNotificationMethod }),
      opted: t.exposeBoolean('opted'),
    }),
  });

  builder.prismaObject('UserPersonalIdentity', {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      id: t.exposeID('id'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
    }),
  });

  builder.prismaObject('UserSingleSignOn', {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      id: t.exposeID('id'),
      provider: t.expose('provider', { type: UserSingleSignOnProvider }),
      email: t.exposeString('email'),
    }),
  });

  const IssueUserSingleSignOnAuthorizationUrlResult = builder.simpleObject(
    'IssueUserSingleSignOnAuthorizationUrlResult',
    {
      fields: (t) => ({
        url: t.string(),
      }),
    },
  );

  const IssueUserEmailAuthorizationUrlResult = builder.simpleObject('IssueUserEmailAuthorizationUrlResult', {
    fields: (t) => ({
      url: t.string(),
    }),
  });

  /**
   * * Inputs
   */

  const IssueUserSingleSignOnAuthorizationUrlInput = builder.inputType('IssueUserSingleSignOnAuthorizationUrlInput', {
    fields: (t) => ({
      type: t.field({ type: UserSingleSignOnAuthorizationType }),
      provider: t.field({ type: UserSingleSignOnProvider }),
    }),
  });

  const LoginUserInput = builder.inputType('LoginUserInput', {
    fields: (t) => ({
      email: t.string(),
    }),
    validate: { schema: LoginUserSchema },
  });

  const CreateUserInput = builder.inputType('CreateUserInput', {
    fields: (t) => ({
      token: t.string(),
      name: t.string(),
      termsConsent: t.boolean(),
      marketingConsent: t.boolean(),
    }),
    validate: { schema: CreateUserSchema },
  });

  const UpdateUserEmailInput = builder.inputType('UpdateUserEmailInput', {
    fields: (t) => ({
      email: t.string(),
    }),
    validate: { schema: UpdateUserEmailSchema },
  });

  const UnlinkUserSingleSignOnInput = builder.inputType('UnlinkUserSingleSignOnInput', {
    fields: (t) => ({
      provider: t.field({ type: UserSingleSignOnProvider }),
    }),
  });

  const UpdateUserContentFilterPreferenceInput = builder.inputType('UpdateUserContentFilterPreferenceInput', {
    fields: (t) => ({
      category: t.field({ type: ContentFilterCategory }),
      action: t.field({ type: ContentFilterAction }),
    }),
  });

  const UpdateUserMarketingConsentInput = builder.inputType('UpdateUserMarketingConsentInput', {
    fields: (t) => ({
      consent: t.boolean(),
    }),
  });

  const UpdateUserNotificationPreferenceInput = builder.inputType('UpdateUserNotificationPreferenceInput', {
    fields: (t) => ({
      category: t.field({ type: UserNotificationCategory }),
      method: t.field({ type: UserNotificationMethod }),
      opted: t.boolean(),
    }),
  });

  const UpdateUserProfileInput = builder.inputType('UpdateUserProfileInput', {
    fields: (t) => ({
      avatarId: t.id(),
      name: t.string(),
    }),
    validate: { schema: UpdateUserProfileSchema },
  });

  const IssueUserEmailAuthorizationUrlInput = builder.inputType('IssueUserEmailAuthorizationUrlInput', {
    fields: (t) => ({
      email: t.string(),
      code: t.string(),
    }),
    validate: { schema: IssueUserEmailAuthorizationUrlSchema },
  });

  const DeleteUserInput = builder.inputType('DeleteUserInput', {
    fields: (t) => ({
      email: t.string(),
    }),
    validate: { schema: DeleteUserSchema },
  });

  /**
   * * Queries
   */

  builder.queryFields((t) => ({
    auth: t.field({
      type: 'Void',
      nullable: true,
      authScopes: (_, args) => ({ [args.scope.toLowerCase()]: true }),
      args: { scope: t.arg({ type: AuthScope }) },
      resolve: () => null,
      unauthorizedError: (_, args) =>
        match(args.scope)
          .with('USER', () => new IntentionalError('로그인이 필요해요'))
          .otherwise(() => new PermissionDeniedError()),
    }),

    me: t.prismaField({
      type: 'User',
      nullable: true,
      resolve: async (query, _, __, { db, ...context }) => {
        if (!context.session) {
          return null;
        }

        return await db.user.findUnique({
          ...query,
          where: { id: context.session.userId },
        });
      },
    }),

    provisionedUser: t.prismaField({
      type: 'ProvisionedUser',
      grantScopes: ['$user'],
      args: { token: t.arg({ type: 'String' }) },
      resolve: async (query, _, args, { db }) => {
        return await db.provisionedUser.findUniqueOrThrow({
          ...query,
          where: { token: args.token },
        });
      },
    }),
  }));

  /**
   * * Mutations
   */

  builder.mutationFields((t) => ({
    loginUser: t.prismaField({
      type: 'UserEmailVerification',
      grantScopes: ['$user'],
      args: { input: t.arg({ type: LoginUserInput }) },
      resolve: async (query, __, { input }, { db, ...context }) => {
        const isEmailExists = await db.user.exists({
          where: {
            email: input.email.toLowerCase(),
            state: 'ACTIVE',
          },
        });

        const code = random(100_000, 999_999).toString();
        const token = nanoid();

        await sendEmail({
          subject: `펜슬 ${isEmailExists ? '로그인' : '가입'}하기`,
          recipient: input.email,
          template: LoginUser,
          props: {
            action: isEmailExists ? '로그인' : '가입',
            code,
            url: qs.stringifyUrl({
              url: `${context.url.origin}/api/email`,
              query: { token },
            }),
          },
        });

        return await db.userEmailVerification.create({
          ...query,
          data: {
            id: createId(),
            kind: 'USER_LOGIN',
            email: input.email.toLowerCase(),
            token,
            code,
            expiresAt: dayjs().add(1, 'hour').toDate(),
          },
        });
      },
    }),

    logoutUser: t.withAuth({ user: true }).field({
      type: 'Void',
      nullable: true,
      resolve: async (_, __, { db, ...context }) => {
        await db.userSession.delete({
          where: { id: context.session.id },
        });

        context.cookies.delete('penxle-at', { path: '/' });
      },
    }),

    issueUserEmailAuthorizationUrl: t.field({
      type: IssueUserEmailAuthorizationUrlResult,
      args: { input: t.arg({ type: IssueUserEmailAuthorizationUrlInput }) },
      resolve: async (_, { input }, { db, ...context }) => {
        const emailVerification = await db.userEmailVerification.findFirst({
          where: {
            email: input.email,
            kind: 'USER_LOGIN',
            code: input.code,
          },
        });

        if (!emailVerification) {
          throw new IntentionalError('올바르지 않은 코드예요.');
        }

        return {
          url: qs.stringifyUrl({
            url: `${context.url.origin}/api/email`,
            query: { token: emailVerification.token },
          }),
        };
      },
    }),

    createUser: t.prismaField({
      type: 'User',
      grantScopes: ['$user'],
      args: { input: t.arg({ type: CreateUserInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const provisionedUser = await db.provisionedUser.findUniqueOrThrow({
          where: { token: input.token },
        });

        const isEmailUsed = await db.user.exists({
          where: {
            email: provisionedUser.email.toLowerCase(),
            state: 'ACTIVE',
          },
        });
        if (isEmailUsed) {
          throw new IntentionalError('이미 가입된 이메일이에요.');
        }

        const avatarId = await directUploadImage({
          db,
          name: 'avatar',
          source: await createRandomAvatar(),
        });

        const profile = await db.profile.create({
          data: {
            id: createId(),
            name: input.name,
            avatarId,
          },
        });

        const user = await db.user.create({
          data: {
            id: createId(),
            email: provisionedUser.email,
            profileId: profile.id,
            state: 'ACTIVE',
          },
        });

        await db.image.update({
          where: { id: avatarId },
          data: { userId: user.id },
        });

        if (input.marketingConsent) {
          await db.userMarketingConsent.create({
            data: {
              id: createId(),
              userId: user.id,
            },
          });
        }

        if (provisionedUser.provider && provisionedUser.principal) {
          await db.userSingleSignOn.create({
            data: {
              id: createId(),
              userId: user.id,
              provider: provisionedUser.provider,
              principal: provisionedUser.principal,
              email: provisionedUser.email,
            },
          });
        }

        await db.provisionedUser.delete({
          where: { id: provisionedUser.id },
        });

        const session = await db.userSession.create({
          data: { id: createId(), userId: user.id },
        });

        const accessToken = await createAccessToken(session.id);
        context.cookies.set('penxle-at', accessToken, {
          path: '/',
          maxAge: dayjs.duration(1, 'year').asSeconds(),
        });

        return await db.user.findUniqueOrThrow({
          ...query,
          where: { id: user.id },
        });
      },
    }),

    issueUserSingleSignOnAuthorizationUrl: t.field({
      type: IssueUserSingleSignOnAuthorizationUrlResult,
      args: { input: t.arg({ type: IssueUserSingleSignOnAuthorizationUrlInput }) },
      resolve: (_, { input }, context) => {
        const provider = match(input.provider)
          .with('GOOGLE', () => google)
          .with('NAVER', () => naver)
          .exhaustive();

        return {
          url: provider.generateAuthorizationUrl(context, input.type),
        };
      },
    }),

    updateUserEmail: t.withAuth({ user: true }).field({
      type: 'Void',
      nullable: true,
      args: { input: t.arg({ type: UpdateUserEmailInput }) },
      resolve: async (_, { input }, { db, ...context }) => {
        const isEmailUsed = await db.user.exists({
          where: {
            email: input.email.toLowerCase(),
            state: 'ACTIVE',
          },
        });

        if (isEmailUsed) {
          return;
        }

        const user = await db.user.findUniqueOrThrow({
          include: { profile: true },
          where: { id: context.session.userId },
        });

        const token = nanoid();

        await db.userEmailVerification.create({
          data: {
            id: createId(),
            userId: user.id,
            kind: 'USER_EMAIL_UPDATE',
            email: input.email.toLowerCase(),
            token,
            expiresAt: dayjs().add(1, 'hour').toDate(),
          },
        });

        await sendEmail({
          subject: 'PENXLE 이메일 변경',
          recipient: input.email,
          template: UpdateUserEmail,
          props: {
            name: user.profile.name,
            email: input.email,
            url: qs.stringifyUrl({
              url: `${context.url.origin}/api/email`,
              query: { token },
            }),
          },
        });
      },
    }),

    updateUserProfile: t.withAuth({ user: true }).prismaField({
      type: 'Profile',
      args: { input: t.arg({ type: UpdateUserProfileInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const avatar = await db.image.findUniqueOrThrow({
          where: {
            id: input.avatarId,
            userId: context.session.userId,
          },
        });

        const user = await db.user.update({
          include: { profile: query },
          where: { id: context.session.userId },
          data: {
            profile: {
              update: {
                avatarId: avatar.id,
                name: input.name,
              },
            },
          },
        });

        return user.profile;
      },
    }),

    updateUserMarketingConsent: t.withAuth({ user: true }).prismaField({
      type: 'User',
      args: { input: t.arg({ type: UpdateUserMarketingConsentInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        if (input.consent) {
          return await db.user.update({
            ...query,
            where: { id: context.session.userId },
            data: {
              marketingConsent: {
                create: {
                  id: createId(),
                },
              },
            },
          });
        } else {
          return await db.user.update({
            ...query,
            where: { id: context.session.userId },
            data: {
              marketingConsent: {
                delete: true,
              },
            },
          });
        }
      },
    }),

    unlinkUserSingleSignOn: t.withAuth({ user: true }).prismaField({
      type: 'User',
      args: { input: t.arg({ type: UnlinkUserSingleSignOnInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        return await db.user.update({
          ...query,
          where: { id: context.session.userId },
          data: {
            singleSignOns: {
              delete: {
                userId_provider: {
                  userId: context.session.userId,
                  provider: input.provider,
                },
              },
            },
          },
        });
      },
    }),

    updateUserNotificationPreference: t.withAuth({ user: true }).prismaField({
      type: 'User',
      args: { input: t.arg({ type: UpdateUserNotificationPreferenceInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        if (input.category === 'ALL') {
          await db.userNotificationPreference.updateMany({
            where: {
              userId: context.session.userId,
              method: input.method,
            },
            data: {
              opted: input.opted,
            },
          });
        }

        return await db.user.update({
          ...query,
          where: { id: context.session.userId },
          data: {
            notificationPreferences: {
              upsert: {
                where: {
                  userId_category_method: {
                    userId: context.session.userId,
                    category: input.category,
                    method: input.method,
                  },
                },
                create: {
                  id: createId(),
                  category: input.category,
                  method: input.method,
                  opted: input.opted,
                },
                update: {
                  opted: input.opted,
                },
              },
            },
          },
        });
      },
    }),

    updateUserContentFilterPreference: t.withAuth({ user: true }).prismaField({
      type: 'User',
      args: { input: t.arg({ type: UpdateUserContentFilterPreferenceInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        if (input.category === 'ADULT' && input.action === 'EXPOSE') {
          const identity = await db.userPersonalIdentity.findUnique({
            where: { userId: context.session.userId },
          });

          if (!identity || !isAdulthood(identity.birthday)) {
            throw new IntentionalError('성인인증이 필요해요.');
          }
        }
        return await db.user.update({
          ...query,
          where: { id: context.session.userId },
          data: {
            contentFilterPreferences: {
              upsert: {
                where: {
                  userId_category: {
                    userId: context.session.userId,
                    category: input.category,
                  },
                },
                create: {
                  id: createId(),
                  category: input.category,
                  action: input.action,
                },
                update: {
                  action: input.action,
                },
              },
            },
          },
        });
      },
    }),

    deleteUser: t.withAuth({ user: true }).field({
      type: 'Void',
      nullable: true,
      args: { input: t.arg({ type: DeleteUserInput }) },
      resolve: async (_, { input }, { db, ...context }) => {
        const user = await db.user.findUniqueOrThrow({
          where: { id: context.session.userId },
        });

        if (user.email !== input.email) {
          throw new IntentionalError('이메일이 일치하지 않아요.');
        }

        const spaceMembers = await db.spaceMember.exists({
          where: {
            userId: context.session.userId,
            state: 'ACTIVE',
            space: { state: 'ACTIVE' },
          },
        });

        if (spaceMembers) {
          throw new IntentionalError('아직 속해있는 스페이스가 있어요');
        }

        await db.user.update({
          where: { id: context.session.userId },
          data: {
            state: 'INACTIVE',
            singleSignOns: {
              deleteMany: {},
            },
          },
        });

        context.cookies.delete('penxle-at', { path: '/' });
      },
    }),
  }));
});
