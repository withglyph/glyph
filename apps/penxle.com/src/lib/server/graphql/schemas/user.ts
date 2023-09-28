import {
  ContentFilterAction,
  ContentFilterCategory,
  UserNotificationCategory,
  UserNotificationMethod,
  UserSingleSignOnProvider,
  UserState,
} from '@prisma/client';
import argon2 from 'argon2';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import qs from 'query-string';
import { match } from 'ts-pattern';
import { FormValidationError, IntentionalError } from '$lib/errors';
import { sendEmail } from '$lib/server/email';
import {
  EmailChange,
  EmailChangeNotice,
  EmailVerification,
  PasswordReset,
  PasswordResetRequest,
} from '$lib/server/email/templates';
import { google, naver } from '$lib/server/external-api';
import { createAccessToken, directUploadImage, generateRandomAvatar } from '$lib/server/utils';
import { createId } from '$lib/utils';
import {
  LoginInputSchema,
  RequestUserEmailUpdateInputSchema,
  RequestUserPasswordResetInputSchema,
  ResetUserPasswordInputSchema,
  SignUpInputSchema,
  UpdateUserPasswordInputSchema,
  UpdateUserProfileInputSchema,
} from '$lib/validations';
import { builder } from '../builder';
import { UserSingleSignOnAuthorizationType } from '../enums';

/**
 * * Types
 */

builder.prismaObject('Profile', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    avatar: t.relation('avatar'),
  }),
});

builder.prismaObject('User', {
  select: { id: true },
  authScopes: (user, context) => user.id === context.session?.userId || { $granted: '$user', staff: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    state: t.expose('state', { type: UserState }),

    contentFilterPreferences: t.relation('contentFilterPreferences', { grantScopes: ['$user'] }),
    marketingConsent: t.relation('marketingConsent', { nullable: true, grantScopes: ['$user'] }),
    notificationPreferences: t.relation('notificationPreferences', { grantScopes: ['$user'] }),
    password: t.relation('password', { nullable: true, grantScopes: ['$user'] }),
    profile: t.relation('profile'),

    singleSignOn: t.prismaField({
      type: 'UserSingleSignOn',
      nullable: true,
      grantScopes: ['$user'],
      args: { provider: t.arg({ type: UserSingleSignOnProvider }) },
      resolve: async (query, parent, args, { db }) => {
        return await db.userSingleSignOn.findUnique({
          ...query,
          where: {
            userId_provider: { userId: parent.id, provider: args.provider },
          },
        });
      },
    }),

    spaces: t.prismaField({
      type: ['Space'],
      select: (_, __, nestedSelection) => ({
        spaces: {
          select: { space: nestedSelection() },
          where: { space: { state: 'ACTIVE' } },
        },
      }),
      resolve: (_, { spaces }) => spaces.map(({ space }) => space),
    }),
  }),
});

builder.prismaObject('UserContentFilterPreference', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    category: t.expose('category', { type: ContentFilterCategory }),
    action: t.expose('action', { type: ContentFilterAction }),
  }),
});

builder.prismaObject('UserEmailVerification', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    expiresAt: t.expose('expiresAt', { type: 'DateTime' }),
  }),
});

builder.prismaObject('UserMarketingConsent', {
  select: { id: true },
  authScopes: { $granted: '$user' },
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

builder.prismaObject('UserNotificationPreference', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    category: t.expose('category', { type: UserNotificationCategory }),
    method: t.expose('method', { type: UserNotificationMethod }),
    opted: t.exposeBoolean('opted'),
  }),
});

builder.prismaObject('UserPassword', {
  select: { id: true },
  authScopes: { $granted: '$user' },
  fields: (t) => ({
    id: t.exposeID('id'),
  }),
});

builder.prismaObject('UserSingleSignOn', {
  select: { id: true },
  authScopes: { $granted: '$user' },
  fields: (t) => ({
    id: t.exposeID('id'),
    providerEmail: t.exposeString('providerEmail'),
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

/**
 * * Inputs
 */

const IssueUserSingleSignOnAuthorizationUrlInput = builder.inputType('IssueUserSingleSignOnAuthorizationUrlInput', {
  fields: (t) => ({
    type: t.field({ type: UserSingleSignOnAuthorizationType }),
    provider: t.field({ type: UserSingleSignOnProvider }),
  }),
});

const LoginInput = builder.inputType('LoginInput', {
  fields: (t) => ({
    email: t.string(),
    password: t.string(),
  }),
  validate: { schema: LoginInputSchema },
});

const RequestUserEmailUpdateInput = builder.inputType('RequestUserEmailUpdateInput', {
  fields: (t) => ({
    email: t.string(),
  }),
  validate: { schema: RequestUserEmailUpdateInputSchema },
});

const RequestUserPasswordResetInput = builder.inputType('RequestUserPasswordResetInput', {
  fields: (t) => ({
    email: t.string(),
  }),
  validate: { schema: RequestUserPasswordResetInputSchema },
});

const ResetUserPasswordInput = builder.inputType('ResetUserPasswordInput', {
  fields: (t) => ({
    code: t.string(),
    password: t.string(),
    passwordConfirm: t.string(),
  }),
  validate: { schema: ResetUserPasswordInputSchema },
});

const SignUpInput = builder.inputType('SignUpInput', {
  fields: (t) => ({
    email: t.string(),
    password: t.string(),
    passwordConfirm: t.string(),
    name: t.string(),
    termsConsent: t.boolean(),
    marketingConsent: t.boolean(),
  }),
  validate: { schema: SignUpInputSchema },
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

const UpdateUserPasswordInput = builder.inputType('UpdateUserPasswordInput', {
  fields: (t) => ({
    oldPassword: t.string({ required: false }),
    newPassword: t.string(),
    newPasswordConfirm: t.string(),
  }),
  validate: { schema: UpdateUserPasswordInputSchema },
});

const UpdateUserProfileInput = builder.inputType('UpdateUserProfileInput', {
  fields: (t) => ({
    name: t.string(),
  }),
  validate: { schema: UpdateUserProfileInputSchema },
});

const VerifyUserEmailInput = builder.inputType('VerifyUserEmailInput', {
  fields: (t) => ({
    code: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
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

  userEmailVerification: t.prismaField({
    type: 'UserEmailVerification',
    args: { code: t.arg({ type: 'String' }) },
    resolve: async (query, _, { code }, { db }) => {
      const userEmailVerification = await db.userEmailVerification.findUnique({
        ...query,
        where: {
          code,
          expiresAt: { gte: new Date() },
        },
      });

      if (!userEmailVerification) {
        throw new IntentionalError('잘못된 코드에요');
      }

      return userEmailVerification;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  login: t.prismaField({
    type: 'User',
    grantScopes: ['$user'],
    args: { input: t.arg({ type: LoginInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const user = await db.user.findFirst({
        select: { id: true, password: { select: { hash: true } } },
        where: {
          email: input.email.toLowerCase(),
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
      });

      if (!user?.password) {
        await argon2.hash(input.password);
        throw new FormValidationError('password', '잘못된 이메일이거나 비밀번호에요.');
      }

      if (!(await argon2.verify(user.password.hash, input.password))) {
        throw new FormValidationError('password', '잘못된 이메일이거나 비밀번호에요.');
      }

      const session = await db.session.create({
        select: { id: true },
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

  signUp: t.prismaField({
    type: 'User',
    grantScopes: ['$user'],
    args: { input: t.arg({ type: SignUpInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const isEmailUsed = await db.user.exists({
        where: {
          email: input.email.toLowerCase(),
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
      });

      if (isEmailUsed) {
        throw new FormValidationError('email', '이미 사용중인 이메일이에요.');
      }

      const avatarId = await directUploadImage({
        db,
        name: 'avatar',
        source: await generateRandomAvatar(),
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
          email: input.email.toLowerCase(),
          profileId: profile.id,
          state: 'PROVISIONAL',
          password: {
            create: {
              id: createId(),
              hash: await argon2.hash(input.password),
            },
          },
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

      const userEmailVerification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: user.id,
          email: user.email,
          type: 'USER_ACTIVATION',
          code: nanoid(),
          expiresAt: dayjs().add(30, 'days').toDate(),
        },
      });

      await sendEmail({
        subject: 'PENXLE 이메일 인증',
        recipient: user.email,
        template: EmailVerification,
        props: {
          name: profile.name,
          url: qs.stringifyUrl({
            url: `${context.url.origin}/user/verify-email`,
            query: { code: userEmailVerification.code },
          }),
        },
      });

      const session = await db.session.create({
        select: { id: true },
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

  logout: t.withAuth({ user: true }).field({
    type: 'Void',
    nullable: true,
    resolve: async (_, __, { db, ...context }) => {
      await db.session.delete({
        where: { id: context.session.id },
      });

      context.cookies.delete('penxle-at', { path: '/' });
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

  requestUserPasswordReset: t.field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: RequestUserPasswordResetInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      const user = await db.user.findFirst({
        select: { id: true, email: true, profile: { select: { name: true } } },
        where: {
          email: input.email.toLowerCase(),
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
      });

      if (!user) {
        throw new FormValidationError('email', '등록된 계정을 찾을 수 없어요.');
      }

      const expiresAt = dayjs().add(1, 'hour').toDate();

      const userEmailVerification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: user.id,
          email: user.email,
          type: 'USER_PASSWORD_RESET',
          code: nanoid(),
          expiresAt,
        },
      });

      await sendEmail({
        subject: 'PENXLE 비밀번호 재설정',
        recipient: user.email,
        template: PasswordResetRequest,
        props: {
          name: user.profile.name,
          url: qs.stringifyUrl({
            url: `${context.url.origin}/user/reset-password`,
            query: { code: userEmailVerification.code },
          }),
        },
      });
    },
  }),

  resetUserPassword: t.field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: ResetUserPasswordInput }) },
    resolve: async (_, { input }, { db }) => {
      const userEmailVerification = await db.userEmailVerification.delete({
        where: {
          code: input.code,
          type: 'USER_PASSWORD_RESET',
          expiresAt: { gte: new Date() },
        },
      });

      await db.userPassword.deleteMany({
        where: { userId: userEmailVerification.userId },
      });

      const user = await db.user.update({
        include: { profile: { select: { name: true } } },
        where: {
          id: userEmailVerification.userId,
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
        data: {
          state: 'ACTIVE',
          password: {
            create: {
              id: createId(),
              hash: await argon2.hash(input.password),
            },
          },
        },
      });

      await sendEmail({
        subject: 'PENXLE 비밀번호가 재설정되었어요.',
        recipient: user.email,
        template: PasswordReset,
        props: {
          name: user.profile.name,
        },
      });
    },
  }),

  requestUserEmailUpdate: t.withAuth({ user: true }).field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: RequestUserEmailUpdateInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      const isEmailUsed = await db.user.exists({
        where: {
          email: input.email.toLowerCase(),
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
      });

      if (isEmailUsed) {
        throw new FormValidationError('email', '이미 사용중인 이메일이에요');
      }

      const user = await db.user.findUniqueOrThrow({
        select: { id: true, profile: { select: { name: true } } },
        where: { id: context.session.userId },
      });

      const userEmailVerification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: user.id,
          type: 'USER_EMAIL_UPDATE',
          email: input.email.toLowerCase(),
          code: nanoid(),
          expiresAt: dayjs().add(1, 'hour').toDate(),
        },
      });

      await sendEmail({
        subject: 'PENXLE 이메일 변경',
        recipient: input.email,
        template: EmailChange,
        props: {
          name: user.profile.name,
          email: input.email,
          url: qs.stringifyUrl({
            url: `${context.url.origin}/user/verify-email`,
            query: { code: userEmailVerification.code },
          }),
        },
      });
    },
  }),

  verifyUserEmail: t.prismaField({
    type: 'User',
    grantScopes: ['$user'],
    args: { input: t.arg({ type: VerifyUserEmailInput }) },
    resolve: async (query, _, { input }, { db }) => {
      const userEmailVerification = await db.userEmailVerification.delete({
        include: { user: { include: { profile: { select: { name: true } } } } },
        where: {
          type: { in: ['USER_ACTIVATION', 'USER_EMAIL_UPDATE'] },
          code: input.code,
          expiresAt: { gte: new Date() },
        },
      });

      if (userEmailVerification.type === 'USER_ACTIVATION') {
        return await db.user.update({
          ...query,
          where: { id: userEmailVerification.user.id },
          data: { state: 'ACTIVE' },
        });
      }

      if (userEmailVerification.type === 'USER_EMAIL_UPDATE') {
        const isEmailUsed = await db.user.exists({
          where: {
            email: userEmailVerification.email,
            state: { in: ['PROVISIONAL', 'ACTIVE'] },
          },
        });

        if (isEmailUsed) {
          throw new Error('Email already in use');
        }

        await sendEmail({
          subject: 'PENXLE 이메일이 변경되었어요.',
          recipient: userEmailVerification.user.email,
          template: EmailChangeNotice,
          props: {
            name: userEmailVerification.user.profile.name,
            email: userEmailVerification.email,
          },
        });

        return await db.user.update({
          ...query,
          where: { id: userEmailVerification.user.id },
          data: {
            email: userEmailVerification.email,
            state: 'ACTIVE',
          },
        });
      }

      throw new Error('Invalid verification type');
    },
  }),

  updateUserProfile: t.withAuth({ user: true }).prismaField({
    type: 'Profile',
    args: { input: t.arg({ type: UpdateUserProfileInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const user = await db.user.update({
        select: { profile: query },
        where: { id: context.session.userId },
        data: {
          profile: {
            update: {
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

  updateUserPassword: t.withAuth({ user: true }).prismaField({
    type: 'User',
    args: { input: t.arg({ type: UpdateUserPasswordInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const user = await db.user.findUniqueOrThrow({
        include: {
          profile: { select: { name: true } },
          password: { select: { id: true, hash: true } },
        },
        where: { id: context.session.userId },
      });

      if (user.password) {
        if (!(await argon2.verify(user.password.hash, input.oldPassword ?? ''))) {
          throw new FormValidationError('oldPassword', '잘못된 비밀번호에요');
        }

        await db.userPassword.delete({
          where: { id: user.password.id },
        });
      }

      await sendEmail({
        subject: 'PENXLE 비밀번호가 재설정되었어요',
        recipient: user.email,
        template: PasswordReset,
        props: {
          name: user.profile.name,
        },
      });

      return await db.user.update({
        ...query,
        where: { id: context.session.userId },
        data: {
          password: {
            create: {
              id: createId(),
              hash: await argon2.hash(input.newPassword),
            },
          },
        },
      });
    },
  }),

  resendUserActivationEmail: t.withAuth({ user: true }).field({
    type: 'Void',
    nullable: true,
    resolve: async (_, __, { db, ...context }) => {
      const user = await db.user.findUniqueOrThrow({
        include: { profile: { select: { name: true } } },
        where: {
          id: context.session.userId,
          state: 'PROVISIONAL',
        },
      });

      const userEmailVerification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: context.session.userId,
          email: user.email,
          type: 'USER_ACTIVATION',
          code: nanoid(),
          expiresAt: dayjs().add(30, 'days').toDate(),
        },
      });

      await sendEmail({
        subject: 'PENXLE 이메일 인증',
        recipient: user.email,
        template: EmailVerification,
        props: {
          name: user.profile.name,
          url: qs.stringifyUrl({
            url: `${context.url.origin}/user/verify-email`,
            query: { code: userEmailVerification.code },
          }),
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
      if (input.category === 'TRIGGER') {
        if (input.action === 'HIDE') {
          await db.userContentFilterPreference.deleteMany({
            where: {
              userId: context.session.userId,
              category: { not: 'ADULT' },
            },
          });
        } else {
          await db.userContentFilterPreference.updateMany({
            where: {
              userId: context.session.userId,
              category: { not: 'ADULT' },
              action: { not: 'HIDE' },
            },
            data: {
              action: input.action,
            },
          });
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
}));
