import { UserSSOProvider } from '@prisma/client';
import argon2 from 'argon2';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import qs from 'query-string';
import { FormValidationError } from '$lib/errors';
import { sendEmail } from '$lib/server/email';
import {
  EmailChange,
  EmailChangeNotice,
  EmailVerification,
  PasswordReset,
  PasswordResetRequest,
} from '$lib/server/email/templates';
import { google } from '$lib/server/external-api';
import {
  createAccessToken,
  createRandomAvatar,
  directUploadImage,
  mergeQuery,
  renderAvatar,
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
  select: {
    id: true,
    state: true,
  },
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email', { authScopes: (user) => ({ user }) }),

    profile: t.relation('profile'),

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

    ssos: t.relation('ssos'),
    isVerified: t.boolean({
      resolve: (user) => user.state === 'ACTIVE',
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

builder.prismaObject('UserSSO', {
  fields: (t) => ({
    id: t.exposeID('id'),
    provider: t.expose('provider', { type: UserSSOProvider }),
    email: t.exposeString('providerEmail'),
  }),
});

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

builder.enumType(UserSSOProvider, { name: 'UserSSOProvider' });

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

const RequestEmailUpdateInput = builder.inputType('requestEmailUpdateInput', {
  fields: (t) => ({
    email: t.string(),
  }),
  validate: { schema: RequestEmailUpdateInputSchema },
});

const ResetPasswordInput = builder.inputType('ResetPasswordInput', {
  fields: (t) => ({
    code: t.string(),
    password: t.string(),
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
  }),
  validate: { schema: UpdatePasswordInputSchema },
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
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  login: t.prismaField({
    type: 'User',
    args: { input: t.arg({ type: LoginInput }) },
    resolve: async (query, _, { input }, context) => {
      const db = context.db;

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

      context.session = { id: session.id, userId: user.id };
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
    args: { input: t.arg({ type: SignupInput }) },
    resolve: async (query, _, { input }, context) => {
      const db = context.db;

      const isEmailUsed = await db.user.exists({
        where: {
          email: input.email.toLowerCase(),
          state: { in: ['PROVISIONAL', 'ACTIVE'] },
        },
      });

      if (isEmailUsed) {
        throw new FormValidationError('email', '이미 사용중인 이메일이에요.');
      }

      const randomAvatar = createRandomAvatar();
      const avatarId = await directUploadImage({
        db,
        name: 'random-avatar.png',
        buffer: await renderAvatar(randomAvatar),
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
          url: `${context.url.origin}/user/verify-email/${verification.code}`,
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

      context.session = { id: session.id, userId: user.id };
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
      if (input.provider === UserSSOProvider.GOOGLE) {
        return { url: google.generateAuthorizationUrl(input.type, context) };
      } else {
        throw new Error('Unsupported provider');
      }
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

      const verification = await db.userEmailVerification.create({
        data: {
          id: createId(),
          userId: user.id,
          email: user.email,
          type: 'PASSWORD_RESET',
          code: nanoid(),
          expiresAt: dayjs().add(1, 'hour').toDate(),
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

  resetPassword: t.prismaField({
    type: 'User',
    args: { input: t.arg({ type: ResetPasswordInput }) },
    resolve: async (query, _, { input }, { db }) => {
      const verification = await db.userEmailVerification.delete({
        where: {
          code: input.code,
          type: 'PASSWORD_RESET',
          expiresAt: { gte: new Date() },
        },
      });

      const user = await db.user.update({
        ...mergeQuery(query, {
          include: { profile: { select: { name: true } } },
        }),
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

      return user;
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
}));
