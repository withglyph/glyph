import { NotFoundError, PermissionDeniedError } from '$lib/errors';
import { createId } from '$lib/utils';
import { CreatePostInputSchema } from '$lib/validations';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Post', {
  fields: (t) => ({
    id: t.exposeID('id'),
    space: t.relation('space'),
    title: t.exposeString('title'),
    subtitle: t.exposeString('subtitle', { nullable: true }),
    content: t.exposeString('content'),
    views: t.exposeInt('views'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    tags: t.prismaField({
      type: ['Tag'],
      select: (_, __, nestedSelection) => ({
        tags: {
          select: { tag: nestedSelection(true) },
        },
      }),
      resolve: (_, { tags }) => tags.map(({ tag }) => tag),
    }),
    images: t.prismaField({
      type: ['Image'],
      select: (_, __, nestedSelection) => ({
        images: {
          select: { image: nestedSelection(true) },
        },
      }),
      resolve: (_, { images }) => images.map(({ image }) => image),
    }),
  }),
});

builder.prismaObject('Tag', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    count: t.exposeInt('count'),
    posts: t.prismaField({
      type: ['Post'],
      select: (_, __, nestedSelection) => ({
        posts: {
          select: { post: nestedSelection(true) },
          where: { post: { state: 'ACTIVE' } },
        },
      }),
      resolve: (_, { posts }) => posts.map(({ post }) => post),
    }),
  }),
});

/**
 * * Inputs
 */

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: (t) => ({
    title: t.string(),
    subtitle: t.string({ required: false }),
    content: t.string(),
    spaceId: t.string(),
    images: t.idList({ required: false }),
  }),
  validate: {
    schema: CreatePostInputSchema,
  },
});

const DeletePostInput = builder.inputType('DeletePostInput', {
  fields: (t) => ({
    id: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  post: t.prismaField({
    type: 'Post',
    args: { id: t.arg.id() },
    resolve: async (query, _, args, { db }) => {
      const post = await db.post.findFirst({
        ...query,
        where: {
          id: args.id,
          state: 'ACTIVE',
        },
      });
      if (!post) {
        throw new NotFoundError();
      }
      return post;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createPost: t.withAuth({ auth: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: CreatePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const space = await db.space.findFirst({
        include: { members: true },
        where: {
          id: input.spaceId,
          members: {
            some: { userId: context.session.userId },
          },
        },
      });
      if (!space) {
        throw new PermissionDeniedError();
      }

      const postId = createId();

      const post = await db.post.create({
        ...query,
        data: {
          id: postId,
          spaceId: input.spaceId,
          userId: context.session.userId,
          title: input.title,
          subtitle: input.subtitle,
          content: input.content,
          images: {
            connect:
              input.images?.map((id) => ({
                postId_imageId: {
                  postId,
                  imageId: id,
                },
              })) ?? [],
          },
        },
      });

      context.track('post:create');

      return post;
    },
  }),

  deletePost: t.withAuth({ auth: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: DeletePostInput }) },
    resolve: async (query, _, { input }, { db, session, track }) => {
      const post = await db.post.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!post || post.state !== 'ACTIVE') {
        throw new NotFoundError();
      }
      if (post.userId !== session.userId) {
        // 작성자가 아니면 권한을 체크
        const space = await db.spaceMember.findFirst({
          where: {
            spaceId: post.spaceId,
            userId: session.userId,
          },
        });
        if (!space || !['OWNER'].includes(space.role)) {
          // 스페이스에서 게시물을 삭제 가능한 권한이 늘어날시 -> 저 배열에 추가하면 OK
          throw new PermissionDeniedError();
        }
      }
      const deletedPost = await db.post.update({
        ...query,
        where: {
          id: input.id,
          state: 'ACTIVE',
        },
        data: { state: 'INACTIVE' },
      });

      track('post:delete');

      return deletedPost;
    },
  }),
}));
