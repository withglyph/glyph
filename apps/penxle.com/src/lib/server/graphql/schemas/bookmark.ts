import { NotFoundError } from '$lib/errors';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('BookmarkGroup', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    posts: t.relation('posts'),
    postCount: t.relationCount('posts', {
      where: {
        post: {
          state: 'PUBLISHED',
          space: {
            state: 'ACTIVE',
          },
        },
      },
    }),
  }),
});

builder.prismaObject('BookmarkGroupPost', {
  fields: (t) => ({
    id: t.exposeID('id'),
    post: t.relation('post'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

/**
 * * Inputs
 */

// const CreateBookmarkInput = builder.inputType('CreateBookmarkInput', {
//   fields: (t) => ({
//     name: t.string(),
//   }),
// });

// const DeleteBookmarkInput = builder.inputType('DeleteBookmarkInput', {
//   fields: (t) => ({
//     bookmarkId: t.id(),
//   }),
// });

// const UpdateBookmarkInput = builder.inputType('UpdateBookmarkInput', {
//   fields: (t) => ({
//     bookmarkId: t.id(),
//     name: t.string(),
//   }),
// });

const BookmarkPostInput = builder.inputType('BookmarkPostInput', {
  fields: (t) => ({
    // bookmarkId: t.id(),
    postId: t.id(),
  }),
});

const UnbookmarkPostInput = builder.inputType('UnbookmarkPostInput', {
  fields: (t) => ({
    bookmarkPostId: t.id(),
  }),
});

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  // createBookmark: t.withAuth({ user: true }).prismaField({
  //   type: 'BookmarkGroup',
  //   args: { input: t.arg({ type: CreateBookmarkInput }) },
  //   resolve: async (query, _, { input }, { db, ...context }) => {
  //     return db.bookmarkGroup.create({
  //       ...query,
  //       data: {
  //         id: createId(),
  //         name: input.name,
  //         user: { connect: { id: context.session.userId } },
  //       },
  //     });
  //   },
  // }),

  // deleteBookmark: t.withAuth({ user: true }).field({
  //   type: 'Void',
  //   args: { input: t.arg({ type: DeleteBookmarkInput }) },
  //   resolve: async (_, { input }, { db, ...context }) => {
  //     await db.bookmarkGroup.delete({
  //       where: {
  //         id: input.bookmarkId,
  //         userId: context.session.userId,
  //       },
  //     });
  //   },
  // }),

  // updateBookmark: t.withAuth({ user: true }).prismaField({
  //   type: 'BookmarkGroup',
  //   args: { input: t.arg({ type: UpdateBookmarkInput }) },
  //   resolve: async (query, _, { input }, { db, ...context }) => {
  //     return db.bookmarkGroup.update({
  //       ...query,
  //       where: {
  //         id: input.bookmarkId,
  //         userId: context.session.userId,
  //       },
  //       data: {
  //         name: input.name,
  //       },
  //     });
  //   },
  // }),

  bookmarkPost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: BookmarkPostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUnique({
        select: {
          spaceId: true,
          state: true,
          option: {
            select: { visibility: true },
          },
        },
        where: {
          id: input.postId,
          state: 'PUBLISHED',
          space: { state: 'ACTIVE' },
        },
      });

      if (!post) {
        throw new NotFoundError();
      }

      if (post.option.visibility === 'SPACE') {
        const meAsMember = await db.spaceMember.exists({
          where: {
            spaceId: post.spaceId,
            userId: context.session.userId,
            state: 'ACTIVE',
          },
        });

        if (!meAsMember) {
          throw new NotFoundError();
        }
      }

      const defaultBookmarkGroup =
        (await db.bookmarkGroup.findFirst({
          select: { id: true },
          where: {
            userId: context.session.userId,
          },
        })) ??
        (await db.bookmarkGroup.create({
          select: { id: true },
          data: {
            id: createId(),
            name: '북마크',
            userId: context.session.userId,
          },
        }));

      const bookmarkGroupPost = await db.bookmarkGroupPost.upsert({
        select: { post: query },
        where: {
          bookmarkGroupId_postId: {
            bookmarkGroupId: defaultBookmarkGroup.id,
            postId: input.postId,
          },
          bookmarkGroup: { userId: context.session.userId },
        },
        create: {
          id: createId(),
          bookmarkGroupId: defaultBookmarkGroup.id,
          postId: input.postId,
        },
        update: {},
      });

      return bookmarkGroupPost.post;
    },
  }),

  unbookmarkPost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UnbookmarkPostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const bookmarkPost = await db.bookmarkGroupPost.delete({
        select: { bookmarkGroupId: true, post: query },
        where: {
          id: input.bookmarkPostId,
          bookmarkGroup: {
            userId: context.session.userId,
          },
        },
      });

      return bookmarkPost.post;
    },
  }),
}));
