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
    permalink: t.exposeString('permalink'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    activeRevision: t.relation('activeRevision'),
    visibility: t.expose('visibility', { type: PostVisibility }),
    author: t.relation('author'),
    space: t.relation('space'),
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
    isDraft: t.boolean({ defaultValue: false }),
  }),
});

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: (t) => ({
    spaceId: t.id(),
    revisionId: t.id(),
    visibility: t.field({ type: PostVisibility, defaultValue: 'PUBLIC' }),
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
        (post.visibility === 'PRIVATE' && post.authorId !== member?.id)
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
    type: 'PostRevision',
    args: { input: t.arg({ type: CreateRevisionInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return db.postRevision.create({
        data: {
          id: createId(),
          title: input.title,
          content: input.content as JSON,
          authorId: context.session.userId,
        },
      });
    },
  }),
  createPost: t.withAuth({ user: true }).prismaField({
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
      const revision = await db.postRevision.findUniqueOrThrow({
        where: { id: input.revisionId },
      });
      return db.post.create({
        ...query,
        data: {
          id: createId(),
          permalink: customAlphabet('123456789', 12)(),
          spaceId: author.spaceId,
          authorId: author.id,
          activeRevisionId: revision.id,
          state: 'ACTIVE',
          visibility: input.visibility,
        },
      });
    },
  }),
}));
