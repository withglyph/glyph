import { PostVisibility } from '@prisma/client';
import { customAlphabet } from 'nanoid';
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
  }),
});

builder.prismaObject('PostRevision', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    content: t.expose('content', { type: 'JSON' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    post: t.relation('post'),
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
