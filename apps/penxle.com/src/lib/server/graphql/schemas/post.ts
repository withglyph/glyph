import { PostRevisionKind, PostVisibility } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { createId } from '$lib/utils';
import { builder } from '../builder';
import type { JSONContent } from '@tiptap/core';

/**
 * * Types
 */

builder.prismaObject('Post', {
  select: { id: true },
  grantScopes: async ({ id }, { db, ...context }) => {
    if (!context.session) {
      return [];
    }
    const post = await db.post.findUniqueOrThrow({
      select: { userId: true, spaceId: true },
      where: { id },
    });
    if (context.session.userId === post.userId) {
      return ['$post:edit'];
    }
    const member = await db.spaceMember.findUnique({
      select: { role: true },
      where: {
        spaceId_userId: {
          spaceId: post.spaceId,
          userId: context.session.userId,
        },
      },
    });
    return member?.role === 'ADMIN' ? ['$post:edit'] : [];
  },
  fields: (t) => ({
    id: t.exposeID('id'),
    permalink: t.exposeString('permalink'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    revision: t.prismaField({
      type: 'PostRevision',
      select: (_, __, nestedSelection) => ({
        revisions: nestedSelection({
          where: { kind: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }),
      }),
      resolve: (_, { revisions }) => revisions[0],
    }),
    revisionList: t.relation('revisions', {
      authScopes: { $granted: '$post:edit' },
      query: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    }),

    liked: t.boolean({
      resolve: async (post, _, { db, ...context }) => {
        if (!context.session) {
          return false;
        }

        return await db.postLike.exists({
          where: {
            postId: post.id,
            userId: context.session.userId,
          },
        });
      },
    }),

    member: t.relation('member'),
    space: t.relation('space'),
    option: t.relation('option'),
    likeCount: t.relationCount('likes'),
  }),
});

builder.prismaObject('PostOption', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    visibility: t.expose('visibility', { type: PostVisibility }),
  }),
});

builder.prismaObject('PostRevision', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    kind: t.expose('kind', { type: PostRevisionKind }),
    title: t.exposeString('title'),
    subtitle: t.exposeString('subtitle', { nullable: true }),
    thumbnailBounds: t.expose('thumbnailBounds', { type: 'JSON', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    content: t.field({
      type: 'JSON',
      select: { content: true },
      resolve: (post) => {
        const postBody = post.content as JSONContent;
        if (!postBody.content) {
          return postBody;
        }
        const accessBarrierIndex = postBody.content.findIndex((node) => node.type === 'access_barrier');
        if (accessBarrierIndex !== -1) {
          return {
            ...postBody,
            content: postBody.content.slice(0, accessBarrierIndex),
          };
        }
        return postBody;
      },
    }),

    thumbnail: t.relation('thumbnail', { nullable: true }),
    coverImage: t.relation('coverImage', { nullable: true }),
  }),
});

/**
 * * Inputs
 */

const RevisePostInput = builder.inputType('RevisePostInput', {
  fields: (t) => ({
    revisionKind: t.field({ type: PostRevisionKind }),

    postId: t.id({ required: false }),
    spaceId: t.id(),

    title: t.string(),
    subtitle: t.string({ required: false }),
    content: t.field({ type: 'JSON' }),

    thumbnailId: t.id({ required: false }),
    thumbnailBounds: t.field({ type: 'JSON', required: false }),
    coverImageId: t.id({ required: false }),
  }),
});

const DeletePostInput = builder.inputType('DeletePostInput', {
  fields: (t) => ({
    postId: t.id(),
  }),
});

const UpdatePostOptionsInput = builder.inputType('UpdatePostOptionsInput', {
  fields: (t) => ({
    postId: t.id(),
    visibility: t.field({ type: PostVisibility, required: false }),
    discloseStats: t.boolean({ required: false }),
    receiveFeedback: t.boolean({ required: false }),
    receivePatronage: t.boolean({ required: false }),
    receiveTagContribution: t.boolean({ required: false }),
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
      const post = await db.post.findUnique({
        include: {
          option: { select: { visibility: true } },
          space: { select: { visibility: true } },
        },
        where: {
          permalink: args.permalink,
          state: 'PUBLISHED',
        },
      });

      if (!post) {
        throw new NotFoundError();
      }

      if (post.space.visibility === 'PRIVATE' || post.option.visibility === 'SPACE') {
        const member = context.session
          ? await db.spaceMember.findUnique({
              select: { id: true },
              where: {
                spaceId_userId: {
                  spaceId: post.spaceId,
                  userId: context.session.userId,
                },
                state: 'ACTIVE',
              },
            })
          : null;

        if (!member) {
          throw new PermissionDeniedError();
        }
      }

      return await db.post.findUniqueOrThrow({
        ...query,
        where: { id: post.id },
      });
    },
  }),

  draftRevision: t.withAuth({ user: true }).prismaField({
    type: 'PostRevision',
    args: { revisionId: t.arg.id() },
    resolve: async (query, _, args, { db, ...context }) =>
      // TODO: 어드민도 접근할 수 있게 권한 체크 추가
      db.postRevision.findUniqueOrThrow({
        ...query,
        where: {
          id: args.revisionId,
          userId: context.session.userId,
        },
      }),
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  revisePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: RevisePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const meAsMember = await db.spaceMember.findUniqueOrThrow({
        select: { id: true, role: true },
        where: {
          spaceId_userId: {
            spaceId: input.spaceId,
            userId: context.session.userId,
          },
        },
      });

      if (input.postId) {
        const post = await db.post.findUniqueOrThrow({
          select: { id: true, userId: true, state: true, spaceId: true },
          where: { id: input.postId },
        });

        if (post.userId !== context.session.userId && (post.spaceId !== input.spaceId || meAsMember.role !== 'ADMIN')) {
          throw new NotFoundError();
        }

        if (post.state === 'PUBLISHED' && post.spaceId !== input.spaceId) {
          throw new IntentionalError('이미 다른 스페이스에 게시된 글이에요.');
        }
      }

      const postId = input.postId ?? createId();

      const revision = {
        userId: context.session.userId,
        kind: input.revisionKind,
        title: input.title,
        subtitle: input.subtitle,
        content: input.content as JSON,
        thumbnailId: input.thumbnailId,
        thumbnailBounds: input.thumbnailBounds ?? undefined,
        coverImageId: input.coverImageId,
      };

      const defaultOptions = {
        visibility: 'PUBLIC',
        discloseStats: true,
        receiveFeedback: true,
        receivePatronage: true,
        receiveTagContribution: true,
      } as const;

      return await db.post.upsert({
        ...query,
        where: { id: postId },
        create: {
          id: postId,
          permalink: customAlphabet('123456789', 12)(),
          space: { connect: { id: input.spaceId } },
          member: { connect: { id: meAsMember.id } },
          user: { connect: { id: context.session.userId } },
          kind: 'ARTICLE',
          state: input.revisionKind === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          revisions: { create: { id: createId(), ...revision } },
          option: { create: { id: createId(), ...defaultOptions } },
        },
        update: {
          space: { connect: { id: input.spaceId } },
          member: { connect: { id: meAsMember.id } },
          user: { connect: { id: context.session.userId } },
          revisions: { create: { id: createId(), ...revision } },
          state: input.revisionKind === 'PUBLISHED' ? 'PUBLISHED' : undefined,
        },
      });
    },
  }),

  deletePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: DeletePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: { id: true, userId: true, spaceId: true },
        where: { id: input.postId },
      });

      if (post.userId !== context.session.userId) {
        const meAsMember = await db.spaceMember.findUniqueOrThrow({
          select: { role: true },
          where: {
            spaceId_userId: {
              spaceId: post.spaceId,
              userId: context.session.userId,
            },
          },
        });
        if (meAsMember.role !== 'ADMIN') {
          throw new PermissionDeniedError();
        }
      }

      return await db.post.update({
        ...query,
        where: { id: post.id },
        data: {
          state: 'DELETED',
        },
      });
    },
  }),

  updatePostOptions: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UpdatePostOptionsInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: { id: true, userId: true, spaceId: true },
        where: { id: input.postId },
      });

      if (post.userId !== context.session.userId) {
        const meAsMember = await db.spaceMember.findUniqueOrThrow({
          select: { role: true },
          where: {
            spaceId_userId: {
              spaceId: post.spaceId,
              userId: context.session.userId,
            },
          },
        });
        if (meAsMember.role !== 'ADMIN') {
          throw new PermissionDeniedError();
        }
      }
      return await db.post.update({
        ...query,
        where: { id: post.id },
        data: {
          option: {
            update: {
              visibility: input.visibility ?? undefined,
              discloseStats: input.discloseStats ?? undefined,
              receiveFeedback: input.receiveFeedback ?? undefined,
              receivePatronage: input.receivePatronage ?? undefined,
              receiveTagContribution: input.receiveTagContribution ?? undefined,
            },
          },
        },
      });
    },
  }),

  likePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: LikePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return db.post.update({
        ...query,
        where: { id: input.postId },
        data: {
          likes: {
            create: {
              id: createId(),
              userId: context.session.userId,
            },
          },
        },
      });
    },
  }),

  unlikePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UnlikePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return db.post.update({
        ...query,
        where: { id: input.postId },
        data: {
          likes: {
            delete: {
              postId_userId: {
                postId: input.postId,
                userId: context.session.userId,
              },
            },
          },
        },
      });
    },
  }),
}));
