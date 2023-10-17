import { PostVisibility } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { NotFoundError } from '$lib/errors';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Post', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    permalink: t.exposeString('permalink', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    activeRevision: t.relation('activeRevision'),
    visibility: t.expose('visibility', { type: PostVisibility }),
    author: t.relation('author'),
    space: t.relation('space'),
    likeCount: t.relationCount('likes'),
  }),
});

builder.prismaObject('PostRevision', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    content: t.expose('content', { type: 'JSON' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

/**
 * * Inputs
 */

const CreateRevisionInput = builder.inputType('CreateRevisionInput', {
  fields: (t) => ({
    title: t.string(),
    content: t.field({ type: 'JSON' }),
    postId: t.id({ required: false }),
  }),
});

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: (t) => ({
    postId: t.id(),
    spaceId: t.id(),
    visibility: t.field({ type: PostVisibility, defaultValue: 'PUBLIC' }),
  }),
});

const LikePostInput = builder.inputType('LikePostInput', {
  fields: (t) => ({
    postId: t.id(),
  }),
});

const UnlikePostInput = builder.inputType('UnlikePostInput', {
  fields: (t) => ({
    postId: t.id(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  post: t.prismaField({
    type: 'Post',
    args: { permalink: t.arg.string() },
    resolve: async (query, _, args, { db, ...context }) => {
      const post = await db.post.findFirstOrThrow({
        include: {
          space: {
            select: { visibility: true },
          },
        },
        where: {
          permalink: args.permalink,
          state: 'ACTIVE',
        },
      });
      if (!post.space || !post.spaceId) {
        throw new NotFoundError();
      }
      const member = context.session
        ? await db.spaceMember.findUnique({
            select: { id: true },
            where: {
              spaceId_userId: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                spaceId: post.spaceId!,
                userId: context.session.userId,
              },
              state: 'ACTIVE',
            },
          })
        : null;

      if (
        (post.space?.visibility === 'PRIVATE' && !member) ||
        (post.visibility === 'MEMBER_ONLY' && !member) ||
        (post.visibility === 'DRAFT' && post.authorId !== member?.id)
      ) {
        throw new NotFoundError();
      }

      return await db.post.findUniqueOrThrow({
        ...query,
        where: { id: post.id },
      });
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createRevision: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: CreateRevisionInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const revisionData = {
        id: createId(),
        title: input.title,
        content: input.content as JSON,
        authorId: context.session.userId,
      };
      return input.postId
        ? await db.post.update({
            where: {
              id: input.postId,
            },
            data: {
              activeRevision: {
                create: revisionData,
              },
              revisions: {
                connect: {
                  id: revisionData.id,
                },
              },
            },
          })
        : await db.post.create({
            data: {
              id: createId(),
              permalink: customAlphabet('123456789', 12)(),
              state: 'ACTIVE',
              visibility: 'DRAFT',
              activeRevision: {
                create: revisionData,
              },
              revisions: {
                connect: {
                  id: revisionData.id,
                },
              },
            },
          });
    },
  }),
  publishPost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: CreatePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const author = await db.spaceMember.findUniqueOrThrow({
        where: {
          spaceId_userId: {
            spaceId: input.spaceId,
            userId: context.session.userId,
          },
          state: 'ACTIVE',
        },
      });
      return db.post.update({
        ...query,
        where: {
          id: input.postId,
        },
        data: {
          spaceId: author.spaceId,
          authorId: author.id,
          state: 'ACTIVE',
          visibility: input.visibility,
        },
      });
    },
  }),
  likePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: LikePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: { id: true },
        where: { id: input.postId },
      });
      await db.postLike.upsert({
        where: {
          postId_userId: {
            postId: post.id,
            userId: context.session.userId,
          },
        },
        update: {},
        create: {
          id: createId(),
          postId: post.id,
          userId: context.session.userId,
        },
      });
      return db.post.findUniqueOrThrow({
        ...query,
        where: { id: post.id },
      });
    },
  }),
  unlikePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UnlikePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: { id: true },
        where: { id: input.postId },
      });
      await db.postLike
        .delete({
          where: {
            postId_userId: {
              postId: post.id,
              userId: context.session.userId,
            },
          },
        })
        .catch(() => true); // ignore not found error
      return db.post.findUniqueOrThrow({
        ...query,
        where: { id: post.id },
      });
    },
  }),
}));
