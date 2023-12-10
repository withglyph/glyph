import { NotFoundError } from '$lib/errors';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('BookmarkGroup', {
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

    thumbnails: t.prismaField({
      type: ['Image'],
      resolve: async (query, bookmarkGroup, _, { db }) => {
        return db.image.findMany({
          ...query,
          where: {
            postRevisionsUsingThisAsCroppedThumbnail: {
              some: {
                kind: 'PUBLISHED',
                post: {
                  state: 'PUBLISHED',
                  space: { state: 'ACTIVE' },
                  bookmarks: {
                    some: {
                      bookmarkGroupId: bookmarkGroup.id,
                    },
                  },
                },
              },
            },
          },

          take: 4,
        });
      },
    }),
  }),
});

builder.prismaObject('BookmarkGroupPost', {
  fields: (t) => ({
    id: t.exposeID('id'),
    post: t.relation('post'),
    bookmarkGroup: t.relation('bookmarkGroup'),
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
    bookmarkId: t.id(),
    postId: t.id(),
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
        where: {
          id: input.postId,
          state: 'PUBLISHED',
          space: { state: 'ACTIVE' },
        },
      });

      if (!post) {
        throw new NotFoundError();
      }

      if (post.visibility === 'SPACE') {
        const meAsMember = await db.spaceMember.existsUnique({
          where: {
            spaceId_userId: {
              spaceId: post.spaceId,
              userId: context.session.userId,
            },
            state: 'ACTIVE',
          },
        });

        if (!meAsMember) {
          throw new NotFoundError();
        }
      }

      const defaultBookmarkGroup =
        (await db.bookmarkGroup.findFirst({
          where: {
            userId: context.session.userId,
          },
        })) ??
        (await db.bookmarkGroup.create({
          data: {
            id: createId(),
            name: '북마크',
            userId: context.session.userId,
          },
        }));

      const bookmarkGroupPost = await db.bookmarkGroupPost.upsert({
        include: { post: query },
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
        include: { post: query },
        where: {
          bookmarkGroupId_postId: {
            bookmarkGroupId: input.bookmarkId,
            postId: input.postId,
          },
          bookmarkGroup: { userId: context.session.userId },
        },
      });

      return bookmarkPost.post;
    },
  }),
}));
