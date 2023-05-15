import dayjs from 'dayjs';
import { FormValidationError } from '$lib/errors';
import { db, injectLoader } from '$lib/server/database';
import { createAccessToken } from '$lib/server/utils';
import { createId } from '$lib/utils';
import { LoginInputSchema, SignupInputSchema } from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

export const User = builder.loadableObject('User', {
  ...injectLoader('users'),
  fields: (t) => ({
    id: t.exposeString('id'),
    email: t.exposeString('email'),
  }),
});

export const Profile = builder.loadableObject('Profile', {
  ...injectLoader('profiles'),
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name'),
    handle: t.exposeString('handle'),
    user: t.field({
      type: User,
      resolve: (profile) => profile.userId,
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
  }),
  validate: { schema: SignupInputSchema },
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  me: t.field({
    type: Profile,
    nullable: true,
    resolve: (_, __, context) => {
      return context.session?.profileId;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  login: t.field({
    type: Profile,
    args: { input: t.arg({ type: LoginInput }) },
    resolve: async (_, { input }, context) => {
      const user = await db
        .selectFrom('users')
        .select(['id', 'state', 'password'])
        .where('email', '=', input.email)
        .executeTakeFirst();

      if (!user || user.state !== 'ACTIVE' || user.password === '') {
        await context.internalApi.hashPassword.mutate(input.password);
        throw new FormValidationError(
          'password',
          '잘못된 이메일이거나 비밀번호에요.'
        );
      }

      if (
        !(await context.internalApi.verifyPassword.mutate({
          hash: user.password,
          password: input.password,
        }))
      ) {
        throw new FormValidationError(
          'password',
          '잘못된 이메일이거나 비밀번호에요.'
        );
      }

      const profile = await db
        .selectFrom('profiles')
        .select('id')
        .where('userId', '=', user.id)
        .where('state', '=', 'PRIMARY')
        .executeTakeFirstOrThrow();

      const sessionId = createId();
      await db
        .insertInto('sessions')
        .values({
          id: sessionId,
          userId: user.id,
          profileId: profile.id,
          createdAt: new Date(),
        })
        .executeTakeFirstOrThrow();

      const accessToken = await createAccessToken(sessionId);
      context.cookies.set('penxle-at', accessToken, {
        expires: dayjs().add(5, 'years').toDate(),
        path: '/',
      });

      return profile.id;
    },
  }),

  logout: t.field({
    type: 'Void',
    resolve: (_, __, context) => {
      context.cookies.delete('penxle-at', { path: '/' });
      return true;
    },
  }),

  signup: t.field({
    type: Profile,
    args: { input: t.arg({ type: SignupInput }) },
    resolve: async (_, { input }, context) => {
      const existingUser = await db
        .selectFrom('users')
        .select('state')
        .where('email', '=', input.email)
        .executeTakeFirst();

      if (existingUser?.state === 'ACTIVE') {
        throw new FormValidationError('email', '이미 사용중인 이메일이에요.');
      }

      return await db.transaction().execute(async (tx) => {
        const userId = createId();
        await tx
          .insertInto('users')
          .values({
            id: userId,
            email: input.email,
            password: await context.internalApi.hashPassword.mutate(
              input.password
            ),
            state: 'ACTIVE',
            createdAt: new Date(),
          })
          .executeTakeFirstOrThrow();

        const profileId = createId();
        await tx
          .insertInto('profiles')
          .values({
            id: profileId,
            userId,
            name: input.name,
            handle: createId(10),
            state: 'PRIMARY',
            createdAt: new Date(),
          })
          .executeTakeFirstOrThrow();

        const sessionId = createId();
        await db
          .insertInto('sessions')
          .values({
            id: sessionId,
            userId,
            profileId,
            createdAt: new Date(),
          })
          .executeTakeFirstOrThrow();

        const accessToken = await createAccessToken(sessionId);
        context.cookies.set('penxle-at', accessToken, {
          expires: dayjs().add(5, 'years').toDate(),
          path: '/',
        });

        return profileId;
      });
    },
  }),
}));
