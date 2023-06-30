import argon2 from 'argon2';
import dayjs from 'dayjs';
import {
  FormValidationError,
  NotFoundError,
  PermissionDeniedError,
} from '$lib/errors';
import { updateUser } from '$lib/server/analytics';
import { createAccessToken } from '$lib/server/utils';
import { createHandle, createId } from '$lib/utils';
import { LoginInputSchema, SignupInputSchema } from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('User', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeString('id'),
    email: t.exposeString('email'),
    profiles: t.relation('profiles', { query: { orderBy: { order: 'asc' } } }),
  }),
});

builder.prismaObject('Profile', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name'),
    handle: t.exposeString('handle'),
    user: t.relation('user'),
    avatar: t.relation('avatar', { nullable: true }),
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

const CreateProfileInput = builder.inputType('CreateProfileInput', {
  fields: (t) => ({
    name: t.string(),
    handle: t.string(),
  }),
});

const SwitchProfileInput = builder.inputType('SwitchProfileInput', {
  fields: (t) => ({
    profileId: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  me: t.prismaField({
    type: 'Profile',
    resolve: async (query, _, __, { db, ...context }) => {
      if (!context.session) {
        throw new PermissionDeniedError();
      }

      return await db.profile.findUniqueOrThrow({
        ...query,
        where: { id: context.session.profileId },
      });
    },
  }),

  meOrNull: t.prismaField({
    type: 'Profile',
    nullable: true,
    resolve: async (query, _, __, { db, ...context }) => {
      if (!context.session) {
        return null;
      }

      return await db.profile.findUnique({
        ...query,
        where: { id: context.session.profileId },
      });
    },
  }),

  profile: t.prismaField({
    type: 'Profile',
    args: { handle: t.arg.string() },
    resolve: async (query, _, args, { db }) => {
      const profile = await db.profile.findFirst({
        ...query,
        where: { handle: args.handle, state: 'ACTIVE' },
      });

      if (profile) {
        return profile;
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
  login: t.prismaField({
    type: 'Profile',
    args: { input: t.arg({ type: LoginInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const user = await db.user.findUnique({
        select: { id: true, state: true, password: true },
        where: { email: input.email.toLowerCase() },
      });

      if (!user || user.state !== 'ACTIVE' || !user.password) {
        await argon2.hash(input.password);
        throw new FormValidationError(
          'password',
          '잘못된 이메일이거나 비밀번호에요.'
        );
      }

      if (!(await argon2.verify(user.password, input.password))) {
        throw new FormValidationError(
          'password',
          '잘못된 이메일이거나 비밀번호에요.'
        );
      }

      const profile = await db.profile.findFirstOrThrow({
        ...query,
        where: { userId: user.id, order: 0 },
      });

      const session = await db.session.create({
        select: { id: true },
        data: {
          id: createId(),
          userId: user.id,
          profileId: profile.id,
        },
      });

      const accessToken = await createAccessToken(session.id);
      context.cookies.set('penxle-at', accessToken, {
        expires: dayjs().add(5, 'years').toDate(),
        path: '/',
      });

      await updateUser(db, context, user.id);
      context.track('user:login', {
        $user_id: user.id,
        method: 'email',
      });

      return profile;
    },
  }),

  logout: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Profile',
    resolve: async (query, _, __, { db, ...context }) => {
      const { profile } = await db.session.delete({
        include: { profile: query },
        where: { id: context.session.id },
      });

      context.cookies.delete('penxle-at', { path: '/' });

      context.track('user:logout');

      return profile;
    },
  }),

  signup: t.prismaField({
    type: 'Profile',
    args: { input: t.arg({ type: SignupInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const existingUser = await db.user.findUnique({
        select: { state: true },
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser?.state === 'ACTIVE') {
        throw new FormValidationError('email', '이미 사용중인 이메일이에요.');
      }

      const user = await db.user.create({
        data: {
          id: createId(),
          email: input.email.toLowerCase(),
          password: await argon2.hash(input.password),
          state: 'ACTIVE',
        },
      });

      const profile = await db.profile.create({
        ...query,
        data: {
          id: createId(),
          userId: user.id,
          name: input.name,
          handle: createHandle(),
          order: 0,
          state: 'ACTIVE',
        },
      });

      const session = await db.session.create({
        select: { id: true },
        data: {
          id: createId(),
          userId: user.id,
          profileId: profile.id,
        },
      });

      const accessToken = await createAccessToken(session.id);
      context.cookies.set('penxle-at', accessToken, {
        expires: dayjs().add(5, 'years').toDate(),
        path: '/',
      });

      await updateUser(db, context, user.id);
      context.track('user:signup', {
        $user_id: user.id,
        method: 'email',
      });

      return profile;
    },
  }),

  createProfile: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Profile',
    args: { input: t.arg({ type: CreateProfileInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const isHandleExists = await db.profile.exists({
        where: { handle: input.handle },
      });

      if (isHandleExists) {
        throw new FormValidationError(
          'handle',
          '이미 사용중인 프로필 URL이에요.'
        );
      }

      const order = await db.profile.count({
        where: { userId: context.session.userId },
      });

      const profile = await db.profile.create({
        ...query,
        data: {
          id: createId(),
          userId: context.session.userId,
          name: input.name,
          handle: input.handle,
          order,
          state: 'ACTIVE',
        },
      });

      await db.session.update({
        where: { id: context.session.id },
        data: { profileId: profile.id },
      });

      context.track('profile:create');

      return profile;
    },
  }),

  switchProfile: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Profile',
    args: { input: t.arg({ type: SwitchProfileInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const profile = await db.profile.findUniqueOrThrow({
        ...query,
        where: {
          id: input.profileId,
          userId: context.session.userId,
          state: 'ACTIVE',
        },
      });

      await db.session.update({
        where: { id: context.session.id },
        data: { profileId: profile.id },
      });

      context.track('profile:switch');

      return profile;
    },
  }),
}));
