import { and, asc, count, desc, eq, or } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { NotFoundError, PermissionDeniedError } from '$lib/errors';
import { database, inArray, Posts, SpaceCollectionPosts, SpaceCollections, Spaces } from '$lib/server/database';
import { enqueueJob } from '$lib/server/jobs';
import { defragmentSpaceCollectionPosts, getSpaceMember, useFirstRow } from '$lib/server/utils';
import {
  AppendSpaceCollectionPostsSchema,
  CreateSpaceCollectionSchema,
  UpdateSpaceCollectionSchema,
} from '$lib/validations';
import { builder } from '../builder';
import { createObjectRef } from '../utils';
import { Image } from './image';
import { Post } from './post';
import { Space } from './space';

/**
 * * Types
 */

const OrderByKind = builder.enumType('SpaceCollectionPostOrderByKind', {
  values: ['OLDEST', 'LATEST'] as const,
});

export const SpaceCollection = createObjectRef('SpaceCollection', SpaceCollections);
SpaceCollection.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    thumbnail: t.field({
      type: Image,
      nullable: true,
      resolve: (spaceCollection) => spaceCollection.thumbnailId,
    }),

    space: t.field({
      type: Space,
      resolve: (spaceCollection) => spaceCollection.spaceId,
    }),

    posts: t.field({
      type: [Post],
      args: { order: t.arg({ type: OrderByKind, defaultValue: 'LATEST' }) },
      resolve: async (spaceCollection, { order }, context) => {
        const meAsMember = await getSpaceMember(context, spaceCollection.spaceId);

        const posts = await database
          .select({ id: Posts.id })
          .from(Posts)
          .innerJoin(SpaceCollectionPosts, eq(Posts.id, SpaceCollectionPosts.postId))
          .where(
            and(
              eq(SpaceCollectionPosts.collectionId, spaceCollection.id),
              eq(Posts.state, 'PUBLISHED'),
              meAsMember ? undefined : eq(Posts.visibility, 'PUBLIC'),
            ),
          )
          .orderBy(
            match(order)
              .with('OLDEST', () => asc(SpaceCollectionPosts.order))
              .with('LATEST', () => desc(SpaceCollectionPosts.order))
              .exhaustive(),
          );

        return posts.map((post) => post.id);
      },
    }),

    count: t.int({
      resolve: async (spaceCollection, _, context) => {
        const meAsMember = await getSpaceMember(context, spaceCollection.spaceId);

        const [{ value }] = await database
          .select({ value: count() })
          .from(Posts)
          .innerJoin(SpaceCollectionPosts, eq(Posts.id, SpaceCollectionPosts.postId))
          .where(
            and(
              eq(SpaceCollectionPosts.collectionId, spaceCollection.id),
              eq(Posts.state, 'PUBLISHED'),
              meAsMember ? undefined : eq(Posts.visibility, 'PUBLIC'),
            ),
          );

        return value;
      },
    }),
  }),
});

export const SpaceCollectionPost = createObjectRef('SpaceCollectionPost', SpaceCollectionPosts);
SpaceCollectionPost.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    order: t.exposeInt('order'),

    post: t.field({
      type: Post,
      resolve: (spaceCollectionPost) => spaceCollectionPost.postId,
    }),
  }),
});

/**
 * * Inputs
 */

const CreateSpaceCollectionInput = builder.inputType('CreateSpaceCollectionInput', {
  fields: (t) => ({
    spaceId: t.id(),
    name: t.string(),
    description: t.string({ required: false }),
  }),
  validate: { schema: CreateSpaceCollectionSchema },
});

const DeleteSpaceCollectionInput = builder.inputType('DeleteSpaceCollectionInput', {
  fields: (t) => ({
    spaceCollectionId: t.id(),
  }),
});

const SetSpaceCollectionPostsInput = builder.inputType('SetSpaceCollectionPostsInput', {
  fields: (t) => ({
    spaceCollectionId: t.id(),
    postIds: t.idList(),
  }),
});

const UpdateSpaceCollectionInput = builder.inputType('UpdateSpaceCollectionInput', {
  fields: (t) => ({
    spaceCollectionId: t.id(),
    name: t.string(),
    thumbnailId: t.id({ required: false }),
    description: t.string({ required: false }),
  }),
  validate: { schema: UpdateSpaceCollectionSchema },
});

const AppendSpaceCollectionPostsInput = builder.inputType('AppendSpaceCollectionPostsInput', {
  fields: (t) => ({
    spaceCollectionId: t.id(),
    postIds: t.idList(),
  }),
  validate: { schema: AppendSpaceCollectionPostsSchema },
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  spaceCollection: t.field({
    type: SpaceCollection,
    args: { slug: t.arg.string() },
    resolve: async (_, args, context) => {
      const collections = await database
        .select({
          id: SpaceCollections.id,
          space: { id: Spaces.id, visibility: Spaces.visibility },
        })
        .from(SpaceCollections)
        .innerJoin(Spaces, eq(SpaceCollections.spaceId, Spaces.id))
        .where(
          and(eq(SpaceCollections.id, args.slug), eq(SpaceCollections.state, 'ACTIVE'), eq(Spaces.state, 'ACTIVE')),
        );

      if (collections.length === 0) {
        throw new NotFoundError();
      }

      const [collection] = collections;

      if (collection.space.visibility === 'PRIVATE') {
        const meAsMember = await getSpaceMember(context, collection.space.id);
        if (!meAsMember) {
          throw new PermissionDeniedError();
        }
      }

      return collection.id;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createSpaceCollection: t.withAuth({ user: true }).field({
    type: SpaceCollection,
    args: { input: t.arg({ type: CreateSpaceCollectionInput }) },
    resolve: async (_, { input }, context) => {
      const meAsMember = await getSpaceMember(context, input.spaceId);
      if (!meAsMember) {
        throw new PermissionDeniedError();
      }

      const [collection] = await database
        .insert(SpaceCollections)
        .values({ spaceId: input.spaceId, name: input.name, description: input.description, state: 'ACTIVE' })
        .returning({ id: SpaceCollections.id });

      await enqueueJob('indexCollection', { collectionId: collection.id });

      return collection.id;
    },
  }),

  deleteSpaceCollection: t.withAuth({ user: true }).field({
    type: SpaceCollection,
    args: { input: t.arg({ type: DeleteSpaceCollectionInput }) },
    resolve: async (_, { input }, context) => {
      const spaceCollections = await database
        .select({ spaceId: SpaceCollections.spaceId })
        .from(SpaceCollections)
        .where(eq(SpaceCollections.id, input.spaceCollectionId));

      if (spaceCollections.length === 0) {
        throw new NotFoundError();
      }

      const meAsMember = await getSpaceMember(context, spaceCollections[0].spaceId);
      if (!meAsMember) {
        throw new PermissionDeniedError();
      }

      await database.transaction(async (tx) => {
        await tx
          .update(SpaceCollections)
          .set({ state: 'INACTIVE' })
          .where(eq(SpaceCollections.id, input.spaceCollectionId));

        await tx.delete(SpaceCollectionPosts).where(eq(SpaceCollectionPosts.collectionId, input.spaceCollectionId));
      });

      await enqueueJob('indexCollection', { collectionId: input.spaceCollectionId });

      return input.spaceCollectionId;
    },
  }),

  updateSpaceCollection: t.withAuth({ user: true }).field({
    type: SpaceCollection,
    args: { input: t.arg({ type: UpdateSpaceCollectionInput }) },
    resolve: async (_, { input }, context) => {
      const spaceCollections = await database
        .select({ spaceId: SpaceCollections.spaceId })
        .from(SpaceCollections)
        .where(and(eq(SpaceCollections.id, input.spaceCollectionId), eq(SpaceCollections.state, 'ACTIVE')));

      if (spaceCollections.length === 0) {
        throw new NotFoundError();
      }

      const meAsMember = await getSpaceMember(context, spaceCollections[0].spaceId);
      if (!meAsMember) {
        throw new PermissionDeniedError();
      }

      await database
        .update(SpaceCollections)
        .set({ name: input.name, thumbnailId: input.thumbnailId ?? null, description: input.description ?? null })
        .where(eq(SpaceCollections.id, input.spaceCollectionId));

      await enqueueJob('indexCollection', { collectionId: input.spaceCollectionId });

      return input.spaceCollectionId;
    },
  }),

  setSpaceCollectionPosts: t.withAuth({ user: true }).field({
    type: SpaceCollection,
    args: { input: t.arg({ type: SetSpaceCollectionPostsInput }) },
    resolve: async (_, { input }, context) => {
      const spaceCollections = await database
        .select({ spaceId: SpaceCollections.spaceId })
        .from(SpaceCollections)
        .where(and(eq(SpaceCollections.id, input.spaceCollectionId), eq(SpaceCollections.state, 'ACTIVE')));

      if (spaceCollections.length === 0) {
        throw new NotFoundError();
      }

      const isSpaceMember = await getSpaceMember(context, spaceCollections[0].spaceId);
      if (!isSpaceMember) {
        throw new PermissionDeniedError();
      }

      const [{ validPostCount }] = await database
        .select({ validPostCount: count() })
        .from(Posts)
        .where(
          and(
            inArray(Posts.id, input.postIds),
            eq(Posts.spaceId, spaceCollections[0].spaceId),
            eq(Posts.state, 'PUBLISHED'),
          ),
        );

      if (validPostCount !== input.postIds.length) {
        throw new PermissionDeniedError();
      }

      await database.transaction(async (tx) => {
        await tx
          .delete(SpaceCollectionPosts)
          .where(
            or(
              eq(SpaceCollectionPosts.collectionId, input.spaceCollectionId),
              inArray(SpaceCollectionPosts.postId, input.postIds),
            ),
          );

        if (input.postIds.length > 0) {
          await tx.insert(SpaceCollectionPosts).values(
            input.postIds.map((postId, order) => ({
              collectionId: input.spaceCollectionId,
              postId,
              order,
            })),
          );
        }
      });

      await enqueueJob('indexCollection', { collectionId: input.spaceCollectionId });

      return input.spaceCollectionId;
    },
  }),

  appendSpaceCollectionPosts: t.withAuth({ user: true }).field({
    type: SpaceCollection,
    args: { input: t.arg({ type: AppendSpaceCollectionPostsInput }) },
    resolve: async (_, { input }, context) => {
      const spaceCollections = await database
        .select()
        .from(SpaceCollections)
        .where(and(eq(SpaceCollections.id, input.spaceCollectionId), eq(SpaceCollections.state, 'ACTIVE')));

      if (spaceCollections.length === 0) {
        throw new NotFoundError();
      }

      const isSpaceMember = await getSpaceMember(context, spaceCollections[0].spaceId);
      if (!isSpaceMember) {
        throw new PermissionDeniedError();
      }

      const targetPostIds = await database
        .select({ id: Posts.id })
        .from(Posts)
        .where(
          and(
            inArray(Posts.id, input.postIds),
            eq(Posts.spaceId, spaceCollections[0].spaceId),
            eq(Posts.state, 'PUBLISHED'),
          ),
        )
        .orderBy(Posts.publishedAt)
        .then((posts) => posts.map((post) => post.id));

      if (targetPostIds.length !== input.postIds.length) {
        throw new PermissionDeniedError();
      }

      await database.transaction(async (tx) => {
        await tx.delete(SpaceCollectionPosts).where(inArray(SpaceCollectionPosts.postId, targetPostIds));

        const lastOrder = await tx
          .select({ order: SpaceCollectionPosts.order })
          .from(SpaceCollectionPosts)
          .where(eq(SpaceCollectionPosts.collectionId, input.spaceCollectionId))
          .orderBy(desc(SpaceCollectionPosts.order))
          .limit(1)
          .then(useFirstRow)
          .then((lastPost) => lastPost?.order ?? 0);

        await tx.insert(SpaceCollectionPosts).values(
          targetPostIds.map((postId, i) => ({
            collectionId: input.spaceCollectionId,
            postId,
            order: lastOrder + i + 1,
          })),
        );

        await defragmentSpaceCollectionPosts(tx, input.spaceCollectionId);
      });

      await enqueueJob('indexCollection', { collectionId: input.spaceCollectionId });
      return spaceCollections[0];
    },
  }),
}));
