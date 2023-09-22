import {
  ContentFilteringAction,
  ContentFilteringCategory,
  UserNotificationCategory,
  UserNotificationMethod,
  UserSSOProvider,
  UserState,
} from '@prisma/client';
import argon2 from 'argon2';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import qs from 'query-string';
import * as R from 'radash';
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
import {
  createAccessToken,
  directUploadImage,
  generateRandomAvatar,
} from '$lib/server/utils';
import { createId } from '$lib/utils';
import {
  LoginInputSchema,
  RequestEmailUpdateInputSchema,
  RequestPasswordResetInputSchema,
  ResetPasswordInputSchema,
  SignupInputSchema,
  UpdatePasswordInputSchema,
  UpdateUserProfileInputSchema,
} from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('User', {
  select: { id: true },
  authScopes: (user) => ({ user, $granted: '$user' }),
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    state: t.expose('state', { type: UserState }),

    profile: t.relation('profile'),
    password: t.relation('password', {
      grantScopes: ['$user'],
      nullable: true,
    }),

    marketingAgreement: t.relation('marketingAgreement', {
      grantScopes: ['$user'],
      nullable: true,
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

    sso: t.prismaField({
      type: 'UserSSO',
      nullable: true,
      grantScopes: ['$user'],
      args: { provider: t.arg({ type: UserSSOProvider }) },
      resolve: async (query, parent, args, { db }) => {
        return await db.userSSO.findUnique({
          ...query,
          where: {
            userId_provider: { userId: parent.id, provider: args.provider },
          },
        });
      },
    }),

    notificationPreferences: t.field({
      type: UserNotificationPreference,
      grantScopes: ['$user'],
      args: { category: t.arg({ type: UserNotificationCategory }) },
      resolve: async (parent, args, { db }) => {
        const preferences = await db.userNotificationOptOut.findMany({
          where: {
            userId: parent.id,
            category: args.category,
          },
        });

        return R.mapValues(
          {
            website: 'WEBSITE',
            email: 'EMAIL',
          },
          (method) =>
            !preferences.some((preference) => preference.method === method),
        );
      },
    }),

    contentFilteringPreferences: t.field({
      type: ContentFilteringAction,
      grantScopes: ['$user'],
      args: { category: t.arg({ type: ContentFilteringCategory }) },
      resolve: async (parent, args, { db }) => {
        const preferences = await db.userContentFilteringPreference.findUnique({
          where: {
            userId_category: {
              userId: parent.id,
              category: args.category,
            },
          },
        });
        return preferences?.action ?? ContentFilteringAction.WARN;
      },
    }),
  }),
});

builder.prismaObject('Profile', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    avatar: t.relation('avatar'),
  }),
});

builder.prismaObject('UserEmailVerification', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    expiresAt: t.expose('expiresAt', { type: 'DateTime' }),
  }),
});

builder.prismaObject('UserSSO', {
  select: { id: true },
  authScopes: { $granted: '$user' },
  fields: (t) => ({
    id: t.exposeID('id'),
    provider: t.expose('provider', { type: UserSSOProvider }),
    email: t.exposeString('providerEmail'),
  }),
});

builder.prismaObject('UserMarketingAgreement', {
  select: { id: true },
  authScopes: { $granted: '$user' },
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

builder.prismaObject('UserPassword', {
  select: { id: true },
  authScopes: { $granted: '$user' },
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

const UserNotificationPreference = builder.simpleObject(
  'UserNotificationPreference',
  {
    authScopes: { $granted: '$user' },
    fields: (t) => ({
      website: t.boolean(),
      email: t.boolean(),
    }),
  },
);

const IssueSSOAuthorizationUrlResult = builder.simpleObject(
  'IssueSSOAuthorizationUrlResult',
  {
    fields: (t) => ({
      url: t.string(),
    }),
  },
);

/**
 * * Enums
 */

builder.enumType(ContentFilteringAction, { name: 'ContentFilteringAction' });
builder.enumType(ContentFilteringCategory, {
  name: 'ContentFilteringCategory',
});
builder.enumType(UserState, { name: 'UserState' });
builder.enumType(UserSSOProvider, { name: 'UserSSOProvider' });
builder.enumType(UserNotificationCategory, {
  name: 'UserNotificationCategory',
});
builder.enumType(UserNotificationMethod, { name: 'UserNotificationMethod' });

const UserSSOAuthorizationType = builder.enumType('UserSSOAuthorizationType', {
  values: ['AUTH', 'LINK'],
});

/**
 * * Inputs
 */

const LoginInput = builder.inputType('LoginInput', {
  fields: (t) => ({
    email: t.string(),
    password: t.string(),
  }),
  validate: { schema: LoginInputSchema },
});

const SignupInput = builder.inputType('SignupInput', {
  fields: (t) => ({
    email: t.string(),
    password: t.string(),
    passwordConfirm: t.string(),
    name: t.string(),
    isAgreed: t.boolean(),
    isMarketingAgreed: t.boolean(),
  }),
  validate: { schema: SignupInputSchema },
});

const IssueSSOAuthorizationUrlInput = builder.inputType(
  'IssueSSOAuthorizationUrlInput',
  {
    fields: (t) => ({
      type: t.field({ type: UserSSOAuthorizationType }),
      provider: t.field({ type: UserSSOProvider }),
    }),
  },
);

const RequestPasswordResetInput = builder.inputType(
  'RequestPasswordResetInput',
  {
    fields: (t) => ({
      email: t.string(),
    }),
    validate: { schema: RequestPasswordResetInputSchema },
  },
);

const RequestEmailUpdateInput = builder.inputType('RequestEmailUpdateInput', {
  fields: (t) => ({
    email: t.string(),
  }),
  validate: { schema: RequestEmailUpdateInputSchema },
});

const ResetPasswordInput = builder.inputType('ResetPasswordInput', {
  fields: (t) => ({
    code: t.string(),
    password: t.string(),
    passwordConfirm: t.string(),
  }),
  validate: { schema: ResetPasswordInputSchema },
});

const VerifyEmailInput = builder.inputType('VerifyEmailInput', {
  fields: (t) => ({
    code: t.string(),
  }),
});

const UpdateUserProfileInput = builder.inputType('UpdateUserProfileInput', {
  fields: (t) => ({
    name: t.string(),
  }),
  validate: { schema: UpdateUserProfileInputSchema },
});

const UpdatePasswordInput = builder.inputType('UpdatePasswordInput', {
  fields: (t) => ({
    oldPassword: t.string({ required: false }),
    newPassword: t.string(),
    newPasswordConfirm: t.string(),
  }),
  validate: { schema: UpdatePasswordInputSchema },
});

const UpdateMarketingAgreementInput = builder.inputType(
  'UpdateMarketingAgreementInput',
  {
    fields: (t) => ({
      isAgreed: t.boolean(),
    }),
  },
);

const UnlinkSSOInput = builder.inputType('UnlinkSSOInput', {
  fields: (t) => ({
    provider: t.field({ type: UserSSOProvider }),
  }),
});

const UpdateContentFilteringPreferenceInput = builder.inputType(
  'UpdateContentFilteringPreferenceInput',
  {
    fields: (t) => ({
      category: t.field({ type: ContentFilteringCategory }),
      action: t.field({ type: ContentFilteringAction }),
    }),
  },
);

const UpdateNotificationPreferencesInput = builder.inputType(
  'UpdateNotificationPreferencesInput',
  {
    fields: (t) => ({
      category: t.field({ type: UserNotificationCategory }),
      method: t.field({ type: UserNotificationMethod }),
      isEnabled: t.boolean(),
    }),
  },
);

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

  emailVerification: t.prismaField({
    type: 'UserEmailVerification',
    args: { code: t.arg({ type: 'String' }) },
    resolve: async (query, _, { code }, { db }) => {
      const emailVerification = await db.userEmailVerification.findUnique({
        ...query,
        where: { code },
      });
      if (!emailVerification || emailVerification.expiresAt < new Date()) {
        throw new IntentionalError('잘못된 코드에요');
      }
      return emailVerification;
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
        throw new FormValidationError(
          'password',
          '잘못된 이메일이거나 비밀번호에요.',
        );
      }

      if (!(await argon2.verify(user.password.hash, input.password))) {
        throw new FormValidationError(
          'password',
          '잘못된 이메일이거나 비밀번호에요.',
        );
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

  logout: t.withAuth({ auth: true }).field({
    type: 'Void',
    nullable: true,
    resolve: async (_, __, { db, ...context }) => {
      await db.session.delete({
        where: { id: context.session.id },
      });

      context.cookies.delete('penxle-at', { path: '/' });
    },
  }),

  signup: t.prismaField({
    type: 'User',
    grantScopes: ['$user'],
    args: { input: t.arg({ type: SignupInput }) },
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

      if (input.isMarketingAgreed) {
        await db.userMarketingAgreement.create({
          data: {
            id: createId(),
            userId: user.id,
          },
        });
      }

      const verification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: user.id,
          email: user.email,
          type: 'USER_ACTIVATION',
          code: nanoid(),
          expiresAt: dayjs().add(30, 'day').toDate(),
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
            query: { code: verification.code },
          }),
        },
      });

      await db.image.update({
        where: { id: avatarId },
        data: { userId: user.id },
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

  issueSSOAuthorizationUrl: t.field({
    type: IssueSSOAuthorizationUrlResult,
    args: { input: t.arg({ type: IssueSSOAuthorizationUrlInput }) },
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

  requestPasswordReset: t.field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: RequestPasswordResetInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      const user = await db.user.findFirst({
        select: { id: true, email: true, profile: { select: { name: true } } },
        where: {
          email: input.email.toLowerCase(),
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
      });

      if (!user) {
        throw new FormValidationError('email', '잘못된 이메일이에요.');
      }

      const expiresAt = dayjs().add(1, 'hour').toDate();

      const verification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: user.id,
          email: user.email,
          type: 'PASSWORD_RESET',
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
            query: { code: verification.code },
          }),
        },
      });
    },
  }),

  resetPassword: t.field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: ResetPasswordInput }) },
    resolve: async (_, { input }, { db }) => {
      const verification = await db.userEmailVerification.delete({
        where: {
          code: input.code,
          type: 'PASSWORD_RESET',
          expiresAt: { gte: new Date() },
        },
      });

      await db.userPassword.deleteMany({
        where: { userId: verification.userId },
      });

      const user = await db.user.update({
        include: { profile: { select: { name: true } } },
        where: {
          id: verification.userId,
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

  requestEmailUpdate: t.withAuth({ auth: true }).field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: RequestEmailUpdateInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      const isEmailUsed = await db.user.exists({
        where: {
          email: input.email.toLowerCase(),
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
      });

      if (isEmailUsed) {
        throw new FormValidationError('email', '이미 사용중인 이메일이에요.');
      }

      const user = await db.user.findUniqueOrThrow({
        select: { id: true, profile: { select: { name: true } } },
        where: { id: context.session.userId },
      });

      const verification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: user.id,
          type: 'EMAIL_UPDATE',
          email: input.email.toLowerCase(),
          code: nanoid(),
          expiresAt: dayjs().add(30, 'day').toDate(),
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
            query: { code: verification.code },
          }),
        },
      });
    },
  }),

  verifyEmail: t.prismaField({
    type: 'User',
    grantScopes: ['$user'],
    args: { input: t.arg({ type: VerifyEmailInput }) },
    resolve: async (query, _, { input }, { db }) => {
      const verification = await db.userEmailVerification.delete({
        include: { user: { include: { profile: { select: { name: true } } } } },
        where: {
          type: { in: ['USER_ACTIVATION', 'EMAIL_UPDATE'] },
          code: input.code,
          expiresAt: { gte: new Date() },
        },
      });

      if (verification.type === 'USER_ACTIVATION') {
        return await db.user.update({
          ...query,
          where: { id: verification.user.id },
          data: { state: 'ACTIVE' },
        });
      }

      if (verification.type === 'EMAIL_UPDATE') {
        const isEmailUsed = await db.user.exists({
          where: {
            email: verification.email,
            state: { in: ['PROVISIONAL', 'ACTIVE'] },
          },
        });

        if (isEmailUsed) {
          throw new Error('Email already in use');
        }

        await sendEmail({
          subject: 'PENXLE 이메일이 변경되었어요.',
          recipient: verification.user.email,
          template: EmailChangeNotice,
          props: {
            name: verification.user.profile.name,
            email: verification.email,
          },
        });

        return await db.user.update({
          ...query,
          where: { id: verification.user.id },
          data: {
            email: verification.email,
            state: 'ACTIVE',
          },
        });
      }

      throw new Error('Invalid verification type');
    },
  }),

  updateUserProfile: t.withAuth({ auth: true }).prismaField({
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

  updateMarketingAgreement: t.withAuth({ auth: true }).prismaField({
    type: 'User',
    args: { input: t.arg({ type: UpdateMarketingAgreementInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      await (input.isAgreed
        ? db.userMarketingAgreement.upsert({
            where: { userId: context.session.userId },
            create: {
              id: createId(),
              userId: context.session.userId,
            },
            update: {},
          })
        : db.userMarketingAgreement.deleteMany({
            where: { userId: context.session.userId },
          }));
      return await db.user.findUniqueOrThrow({
        ...query,
        where: { id: context.session.userId },
      });
    },
  }),

  unlinkSSO: t.withAuth({ auth: true }).prismaField({
    type: 'User',
    args: { input: t.arg({ type: UnlinkSSOInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      await db.userSSO.deleteMany({
        where: { userId: context.session.userId, provider: input.provider },
      });
      return await db.user.findUniqueOrThrow({
        ...query,
        where: { id: context.session.userId },
      });
    },
  }),

  updatePassword: t.withAuth({ auth: true }).prismaField({
    type: 'User',
    args: { input: t.arg({ type: UpdatePasswordInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const user = await db.user.findUniqueOrThrow({
        include: {
          profile: { select: { name: true } },
          password: { select: { id: true, hash: true } },
        },
        where: { id: context.session.userId },
      });

      if (user.password) {
        if (
          !(await argon2.verify(user.password.hash, input.oldPassword ?? ''))
        ) {
          throw new FormValidationError('oldPassword', '잘못된 비밀번호에요.');
        }

        await db.userPassword.delete({
          where: { id: user.password.id },
        });
      }

      await sendEmail({
        subject: 'PENXLE 비밀번호가 재설정되었어요.',
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

  resendUserActivationEmail: t.withAuth({ auth: true }).field({
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

      const verification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: context.session.userId,
          email: user.email,
          type: 'USER_ACTIVATION',
          code: nanoid(),
          expiresAt: dayjs().add(30, 'day').toDate(),
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
            query: { code: verification.code },
          }),
        },
      });
    },
  }),

  updateNotificationPreferences: t.withAuth({ auth: true }).field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: UpdateNotificationPreferencesInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      await (input.isEnabled
        ? db.userNotificationOptOut.deleteMany({
            where: {
              userId: context.session.userId,
              category: input.category,
              method: input.method,
            },
          })
        : db.userNotificationOptOut.upsert({
            where: {
              userId_category_method: {
                userId: context.session.userId,
                category: input.category,
                method: input.method,
              },
            },
            create: {
              id: createId(),
              userId: context.session.userId,
              category: input.category,
              method: input.method,
            },
            update: {},
          }));
    },
  }),

  updateContentFilteringPreference: t.withAuth({ auth: true }).prismaField({
    type: 'User',
    args: { input: t.arg({ type: UpdateContentFilteringPreferenceInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      await db.userContentFilteringPreference.upsert({
        where: {
          userId_category: {
            userId: context.session.userId,
            category: input.category,
          },
        },
        create: {
          id: createId(),
          userId: context.session.userId,
          category: input.category,
          action: input.action,
        },
        update: { action: input.action },
      });
      return await db.user.findUniqueOrThrow({
        ...query,
        where: { id: context.session.userId },
      });
    },
  }),
}));
