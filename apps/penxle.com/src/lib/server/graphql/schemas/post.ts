import { PostRevisionKind, PostVisibility } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
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

    member: t.relation('member'),
    option: t.relation('option'),
    space: t.relation('space'),
  }),
});

const PostDraft = builder.prismaObject('Post', {
  select: { id: true },
  variant: 'PostDraft',
  fields: (t) => ({
    id: t.exposeID('id'),

    revisionInfoList: t.relation('revisions', {
      query: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    }),

    revision: t.prismaField({
      type: 'PostRevision',
      select: (_, __, nestedSelection) => ({
        revisions: nestedSelection({
          orderBy: { createdAt: 'desc' },
          take: 1,
        }),
      }),
      resolve: (_, { revisions }) => revisions[0],
    }),

    space: t.relation('space'),

    post: t.variant('Post'),
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
      resolve: ({ content }) => {
        // TODO: 유료분량 처리
        return content;
      },
    }),

    thumbnail: t.relation('thumbnail'),
    coverImage: t.relation('coverImage'),
  }),
});

/**
 * * Inputs
 */

const DraftPostInput = builder.inputType('DraftPostInput', {
  fields: (t) => ({
    revisionKind: t.field({ type: PostRevisionKind }),

    postId: t.id({ required: false }),
    spaceId: t.id(),

    title: t.string(),
    subtitle: t.string({ required: false }),
    content: t.field({ type: 'JSON' }),

    visibility: t.field({ type: PostVisibility }),
    discloseStats: t.boolean(),
    receiveFeedback: t.boolean(),
    receivePatronage: t.boolean(),
    receiveTagContribution: t.boolean(),
  }),
});

const PublishPostInput = builder.inputType('PublishPostInput', {
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
  draftPost: t.withAuth({ user: true }).prismaField({
    type: PostDraft,
    args: { input: t.arg({ type: DraftPostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const meAsMember = await db.spaceMember.findUniqueOrThrow({
        select: {
          id: true,
          role: true,
        },
        where: {
          spaceId_userId: {
            spaceId: input.spaceId,
            userId: context.session.userId,
          },
        },
      });

      if (input.postId) {
        const post = await db.post.findUniqueOrThrow({
          select: {
            id: true,
            userId: true,
            state: true,
            spaceId: true,
          },
          where: {
            id: input.postId,
          },
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
      };

      const options = {
        visibility: input.visibility,
        discloseStats: input.discloseStats,
        receiveFeedback: input.receiveFeedback,
        receivePatronage: input.receivePatronage,
        receiveTagContribution: input.receiveTagContribution,
      };

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
          state: 'DRAFT',
          revisions: { create: { id: createId(), ...revision } },
          option: { create: { id: createId(), ...options } },
        },
        update: {
          space: { connect: { id: input.spaceId } },
          member: { connect: { id: meAsMember.id } },
          user: { connect: { id: context.session.userId } },
          revisions: { create: { id: createId(), ...revision } },
          option: { update: { ...options } },
        },
      });
    },
  }),

  publishPost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: PublishPostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const targetRevision = await db.postRevision.findFirstOrThrow({
        select: { id: true, kind: true },
        where: {
          postId: input.postId,
          userId: context.session.userId,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      if (targetRevision.kind === 'PUBLISHED') {
        throw new IntentionalError('이미 게시된 글입니다.');
      }

      await db.postRevision.update({
        where: { id: targetRevision.id },
        data: { kind: 'PUBLISHED' },
      });

      return db.post.update({
        ...query,
        where: {
          id: input.postId,
          member: {
            userId: context.session.userId,
          },
        },
        data: { state: 'PUBLISHED' },
      });
    },
  }),
}));
