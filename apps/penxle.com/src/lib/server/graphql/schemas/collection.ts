import { FormValidationError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { createId } from '$lib/utils';
import { defineSchema } from '../builder';

export const collectionSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('SpaceCollection', {
    select: { id: true },
    fields: (t) => ({
      id: t.exposeID('id'),
      name: t.exposeString('name'),
      thumbnail: t.relation('thumbnail'),
      count: t.relationCount('posts'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),

      posts: t.prismaField({
        type: ['Post'],
        select: { spaceId: true },
        resolve: async (query, collection, __, { db, ...context }) => {
          const meAsMember = context.session?.userId
            ? await db.spaceMember.findFirst({
                where: {
                  spaceId: collection.spaceId,
                  userId: context.session.userId,
                  state: 'ACTIVE',
                },
              })
            : null;

          const collectionPosts = await db.spaceCollectionPost.findMany({
            include: { post: query },
            where: {
              collectionId: collection.id,
              post: {
                state: 'PUBLISHED',
                visibility: meAsMember ? undefined : 'PUBLIC',
              },
            },
            orderBy: { order: 'asc' },
          });

          return collectionPosts.map((cp) => cp.post);
        },
      }),
    }),
  });

  builder.prismaObject('SpaceCollectionPost', {
    select: { id: true },
    fields: (t) => ({
      id: t.exposeID('id'),
      post: t.relation('post'),
      order: t.exposeInt('order'),
    }),
  });

  /**
   * * Inputs
   */

  const CreateSpaceCollectionInput = builder.inputType('CreateSpaceCollectionInput', {
    fields: (t) => ({
      spaceId: t.id(),
      name: t.string(),
    }),
  });

  const DeleteSpaceCollectionInput = builder.inputType('DeleteSpaceCollectionInput', {
    fields: (t) => ({
      collectionId: t.id(),
    }),
  });

  const UpdatePostCollectionInput = builder.inputType('UpdatePostCollectionInput', {
    fields: (t) => ({
      collectionId: t.id({ required: false }),
      postId: t.id(),
    }),
  });

  const ReorderSpaceCollectionInput = builder.inputType('ReorderSpaceCollectionInput', {
    fields: (t) => ({
      collectionId: t.id(),
      postId: t.id(),
      order: t.int(),
    }),
  });

  const UpdateCollectionInput = builder.inputType('UpdateCollectionInput', {
    fields: (t) => ({
      collectionId: t.id(),
      name: t.string(),
      thumbnailId: t.id({ required: false }),
    }),
  });

  /**
   * * Mutations
   */

  builder.mutationFields((t) => ({
    createSpaceCollection: t.withAuth({ user: true }).prismaField({
      type: 'SpaceCollection',
      args: { input: t.arg({ type: CreateSpaceCollectionInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const meAsMember = await db.spaceMember.findFirst({
          where: {
            spaceId: input.spaceId,
            userId: context.session.userId,
            state: 'ACTIVE',
          },
        });

        if (!meAsMember) {
          throw new PermissionDeniedError();
        }

        return db.spaceCollection.create({
          ...query,
          data: {
            id: createId(),
            state: 'ACTIVE',
            name: input.name,
            spaceId: input.spaceId,
          },
        });
      },
    }),

    deleteSpaceCollection: t.withAuth({ user: true }).prismaField({
      type: 'SpaceCollection',
      args: { input: t.arg({ type: DeleteSpaceCollectionInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        return db.spaceCollection.update({
          ...query,
          where: {
            id: input.collectionId,
            space: {
              members: {
                some: {
                  userId: context.session.userId,
                  state: 'ACTIVE',
                },
              },
            },
          },
          data: {
            state: 'INACTIVE',
          },
        });
      },
    }),

    updatePostCollection: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: UpdatePostCollectionInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const meAsMember = await db.spaceMember.exists({
          where: {
            space: {
              posts: {
                some: {
                  id: input.postId,
                },
              },
              collections: input.collectionId
                ? {
                    some: {
                      id: input.collectionId,
                    },
                  }
                : undefined,
            },
            userId: context.session.userId,
            state: 'ACTIVE',
          },
        });

        if (!meAsMember) {
          throw new PermissionDeniedError();
        }

        const post = await db.post.findUniqueOrThrow({
          select: { id: true, collectionPost: true },
          where: { id: input.postId },
        });

        const deleteCollectionPost = async (id: string) => {
          const deletedCollectionPost = await db.spaceCollectionPost.delete({
            select: { collectionId: true, order: true },
            where: { id },
          });

          await db.spaceCollectionPost.updateMany({
            where: {
              collectionId: deletedCollectionPost.collectionId,
              order: { gt: deletedCollectionPost.order },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        };

        if (input.collectionId) {
          if (post.collectionPost) {
            await deleteCollectionPost(post.collectionPost.id);
          }

          const lastOrder = await db.spaceCollectionPost.findFirst({
            select: { order: true },
            where: {
              collectionId: input.collectionId,
            },
            orderBy: { order: 'desc' },
          });

          await db.spaceCollectionPost.create({
            data: {
              id: createId(),
              collectionId: input.collectionId,
              postId: input.postId,
              order: lastOrder ? lastOrder.order + 1 : 0,
            },
          });
        } else {
          if (!post.collectionPost) {
            throw new NotFoundError();
          }

          await deleteCollectionPost(post.collectionPost.id);
        }

        return db.post.findUniqueOrThrow({
          ...query,
          where: { id: post.id },
        });
      },
    }),

    reorderSpaceCollection: t.withAuth({ user: true }).prismaField({
      type: 'SpaceCollection',
      args: { input: t.arg({ type: ReorderSpaceCollectionInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const meAsMember = await db.spaceMember.exists({
          where: {
            space: {
              collections: {
                some: {
                  id: input.collectionId,
                },
              },
            },
            userId: context.session.userId,
            state: 'ACTIVE',
          },
        });

        if (!meAsMember) {
          throw new PermissionDeniedError();
        }

        const lastOrder = await db.spaceCollectionPost.findFirstOrThrow({
          select: { order: true },
          where: {
            collectionId: input.collectionId,
          },
          orderBy: { order: 'desc' },
        });

        if (lastOrder.order < input.order) {
          throw new FormValidationError('order', '잘못된 순서에요');
        }

        const originalOrder = await db.spaceCollectionPost.findFirstOrThrow({
          select: { order: true },
          where: {
            postId: input.postId,
          },
        });

        await db.spaceCollectionPost.update({
          where: {
            postId: input.postId,
          },
          data: {
            order: lastOrder.order + 1,
          },
        });

        if (originalOrder.order > input.order) {
          await db.spaceCollectionPost.updateMany({
            where: {
              collectionId: input.collectionId,
              order: { lt: originalOrder.order, gte: input.order },
            },
            data: {
              order: { increment: 1 },
            },
          });
        } else if (originalOrder.order < input.order) {
          await db.spaceCollectionPost.updateMany({
            where: {
              collectionId: input.collectionId,
              order: { gt: originalOrder.order, lte: input.order },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        }

        await db.spaceCollectionPost.update({
          where: {
            postId: input.postId,
          },
          data: {
            order: input.order,
          },
        });

        return db.spaceCollection.findUniqueOrThrow({
          ...query,
          where: {
            id: input.collectionId,
          },
        });
      },
    }),

    updateSpaceCollection: t.withAuth({ user: true }).prismaField({
      type: 'SpaceCollection',
      args: { input: t.arg({ type: UpdateCollectionInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const meAsMember = await db.spaceMember.exists({
          where: {
            space: {
              collections: {
                some: {
                  id: input.collectionId,
                },
              },
            },
            userId: context.session.userId,
            state: 'ACTIVE',
          },
        });

        if (!meAsMember) {
          throw new PermissionDeniedError();
        }

        return db.spaceCollection.update({
          ...query,
          where: {
            id: input.collectionId,
          },
          data: {
            name: input.name,
            thumbnailId: input.thumbnailId,
          },
        });
      },
    }),
  }));
});
