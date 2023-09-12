import { UserSSOProvider } from '@prisma/client';
import argon2 from 'argon2';
import dayjs from 'dayjs';
import { FormValidationError } from '$lib/errors';
import { updateUser } from '$lib/server/analytics';
import { sendEmail } from '$lib/server/email';
import {
  PasswordReset,
  PasswordResetRequest,
} from '$lib/server/email/templates';
import { google } from '$lib/server/external-api';
import {
  createAccessToken,
  createRandomAvatar,
  directUploadImage,
  renderAvatar,
} from '$lib/server/utils';
import { createId } from '$lib/utils';
import {
  LoginInputSchema,
  RequestPasswordResetInputSchema,
  ResetPasswordInputSchema,
  SignUpInputSchema,
  UpdatePasswordInputSchema,
  UpdateUserProfileInputSchema,
} from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('User', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email', { authScopes: (user) => ({ user }) }),

    profile: t.relation('profile'),

    spaces: t.prismaField({
      type: ['Space'],
      select: (_, __, nestedSelection) => ({
        spaces: {
          select: { space: nestedSelection(true) },
          where: { space: { state: 'ACTIVE' } },
        },
      }),
      resolve: (_, { spaces }) => spaces.map(({ space }) => space),
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
    expiresAt: t.expose('expiresAt', {
      type: 'DateTime',
    }),
  }),
});

/**
 * * Enums
 */

builder.enumType(UserSSOProvider, { name: 'UserSSOProvider' });

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

const SignUpInput = builder.inputType('SignUpInput', {
  fields: (t) => ({
    email: t.string(),
    password: t.string(),
    name: t.string(),
    isAgreed: t.boolean(),
  }),
  validate: { schema: SignUpInputSchema },
});

const IssueSSOAuthorizationUrlInput = builder.inputType(
  'IssueSSOAuthorizationUrlInput',
  {
    fields: (t) => ({
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

const ResetPasswordInput = builder.inputType('ResetPasswordInput', {
  fields: (t) => ({
    token: t.string(),
    password: t.string(),
  }),
  validate: { schema: ResetPasswordInputSchema },
});

const UpdateUserProfileInput = builder.inputType('UpdateUserProfileInput', {
  fields: (t) => ({
    name: t.string(),
  }),
  validate: { schema: UpdateUserProfileInputSchema },
});

const UpdatePasswordInput = builder.inputType('UpdatePasswordInput', {
  fields: (t) => ({
    password: t.string(),
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
    resolve: async (query, _, { input }, { db, ...context }) => {
      const user = await db.user.findUnique({
        select: { id: true, password: { select: { hash: true } } },
        where: { email: input.email.toLowerCase(), state: 'ACTIVE' },
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

      await updateUser(db, context, user.id);
      context.track('user:login', {
        $user_id: user.id,
        method: 'email',
      });

      return await db.user.findUniqueOrThrow({
        ...query,
        where: { id: user.id },
      });
    },
  }),

  logout: t.withAuth({ auth: true }).prismaField({
    type: 'User',
    resolve: async (query, _, __, { db, ...context }) => {
      const { user } = await db.session.delete({
        include: { user: query },
        where: { id: context.session.id },
      });

      context.cookies.delete('penxle-at', { path: '/' });

      context.track('user:logout');

      return user;
    },
  }),

  signUp: t.prismaField({
    type: 'User',
    args: { input: t.arg({ type: SignUpInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const isEmailUsed = await db.user.exists({
        where: { email: input.email.toLowerCase(), state: 'ACTIVE' },
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
        ...query,
        data: {
          id: createId(),
          email: input.email.toLowerCase(),
          profileId: profile.id,
          state: 'ACTIVE',
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

      const session = await db.session.create({
        select: { id: true },
        data: { id: createId(), userId: user.id },
      });

      const accessToken = await createAccessToken(session.id);
      context.cookies.set('penxle-at', accessToken, {
        path: '/',
        maxAge: dayjs.duration(1, 'year').asSeconds(),
      });

      await updateUser(db, context, user.id);
      context.track('user:sign-up', {
        $user_id: user.id,
        method: 'email',
      });

      return user;
    },
  }),

  issueSSOAuthorizationUrl: t.string({
    args: { input: t.arg({ type: IssueSSOAuthorizationUrlInput }) },
    resolve: (_, { input }, context) => {
      if (input.provider === UserSSOProvider.GOOGLE) {
        return google.generateAuthorizationUrl(context);
      } else {
        throw new Error('Unsupported provider');
      }
    },
  }),

  requestPasswordReset: t.prismaField({
    type: 'UserEmailVerification',
    args: { input: t.arg({ type: RequestPasswordResetInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const user = await db.user.findUnique({
        select: {
          id: true,
          email: true,
          profile: {
            select: { name: true },
          },
        },
        where: { email: input.email.toLowerCase(), state: 'ACTIVE' },
      });

      if (!user) {
        throw new FormValidationError('email', '잘못된 이메일이에요.');
      }

      const token = createId();

      await sendEmail({
        subject: 'PENXLE 비밀번호 재설정',
        recipient: user.email,
        template: PasswordResetRequest,
        props: {
          name: user.profile.name,
          url: `${context.url.origin}/reset-password?token=${token}`, // TODO: 비밀번호 재설정 페이지 URL 확정 필요
        },
      });

      const request = await db.userEmailVerification.create({
        ...query,
        data: {
          id: createId(),
          userId: user.id,
          type: 'PASSWORD_RESET',
          token,
          expiresAt: dayjs().add(1, 'hour').toDate(),
        },
      });

      context.track('user:password-reset:request');

      return request;
    },
  }),

  resetPassword: t.boolean({
    args: { input: t.arg({ type: ResetPasswordInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      const request = await db.userEmailVerification.findUniqueOrThrow({
        where: {
          token: input.token,
          type: 'PASSWORD_RESET',
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      const user = await db.user.update({
        include: { profile: true },
        where: { id: request.userId },
        data: {
          password: {
            create: {
              id: createId(),
              hash: await argon2.hash(input.password),
            },
          },
        },
      });

      await db.userEmailVerification.delete({
        where: { id: request.id },
      });

      await sendEmail({
        subject: 'PENXLE 비밀번호가 재설정되었어요.',
        recipient: user.email,
        template: PasswordReset,
        props: {
          name: user.profile.name,
        },
      });

      context.track('user:password-reset:reset');

      return true;
    },
  }),

  updateUserProfile: t.withAuth({ auth: true }).prismaField({
    type: 'Profile',
    args: { input: t.arg({ type: UpdateUserProfileInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const { profile } = await db.user.update({
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

      context.track('profile:user:update');

      return profile;
    },
  }),

  updatePassword: t.withAuth({ auth: true }).boolean({
    args: { input: t.arg({ type: UpdatePasswordInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      const user = await db.user.update({
        include: { profile: true },
        where: { id: context.session.userId },
        data: {
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

      return true;
    },
  }),
}));
