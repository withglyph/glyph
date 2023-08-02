import argon2 from 'argon2';
import dayjs from 'dayjs';
import { FormValidationError } from '$lib/errors';
import { updateUser } from '$lib/server/analytics';
import { createAccessToken } from '$lib/server/utils';
import { createId } from '$lib/utils';
import {
  LoginInputSchema,
  SignupInputSchema,
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
    name: t.exposeString('name'),

    avatar: t.relation('avatar'),
  }),
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
    name: t.string(),
    isAgreed: t.boolean(),
  }),
  validate: { schema: SignupInputSchema },
});

const UpdateUserProfileInput = builder.inputType('UpdateUserProfileInput', {
  fields: (t) => ({
    name: t.string(),
  }),
  validate: { schema: UpdateUserProfileInputSchema },
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  me: t.withAuth({ auth: true }).prismaField({
    type: 'User',
    resolve: async (query, _, __, { db, ...context }) => {
      return await db.user.findUniqueOrThrow({
        ...query,
        where: { id: context.session.userId },
      });
    },
  }),

  meOrNull: t.prismaField({
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
        include: query.include,
        select: { id: true, password: true, ...query.select },
        where: { email: input.email.toLowerCase(), state: 'ACTIVE' },
      });

      if (!user?.password) {
        await argon2.hash(input.password);
        throw new FormValidationError(
          'password',
          '잘못된 이메일이거나 비밀번호에요.',
        );
      }

      if (!(await argon2.verify(user.password, input.password))) {
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

      return user;
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

  signup: t.prismaField({
    type: 'User',
    args: { input: t.arg({ type: SignupInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const isEmailUsed = await db.user.exists({
        ...query,
        where: { email: input.email.toLowerCase(), state: 'ACTIVE' },
      });

      if (isEmailUsed) {
        throw new FormValidationError('email', '이미 사용중인 이메일이에요.');
      }

      const profile = await db.profile.create({
        data: {
          id: createId(),
          name: input.name,
          avatarId: 'FIXME',
        },
      });

      const user = await db.user.create({
        data: {
          id: createId(),
          email: input.email.toLowerCase(),
          password: await argon2.hash(input.password),
          profileId: profile.id,
          state: 'ACTIVE',
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

      await updateUser(db, context, user.id);
      context.track('user:signup', {
        $user_id: user.id,
        method: 'email',
      });

      return user;
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
}));
