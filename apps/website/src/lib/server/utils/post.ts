import { webcrypto } from 'node:crypto';
import { and, asc, count, eq, gt } from 'drizzle-orm';
import stringify from 'fast-json-stable-stringify';
import * as R from 'radash';
import * as Y from 'yjs';
import { redis, useCache } from '$lib/server/cache';
import { getMetadataFromTiptapDocument } from '$lib/utils';
import {
  database,
  inArray,
  PostContentStates,
  PostContentUpdates,
  PostPurchases,
  PostRevisionContents,
  PostViews,
  SpaceCollectionPosts,
} from '../database';
import type { JSONContent } from '@tiptap/core';
import type { Context } from '../context';
import type { Transaction } from '../database';

export const makePostContentId = async (tx: Transaction, nodes: JSONContent[]) => {
  if (nodes.length === 0) {
    return null;
  }

  const hash = Buffer.from(
    await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(stringify(nodes))),
  ).toString('hex');

  const { text, characters, images, files } = getMetadataFromTiptapDocument({ type: 'document', content: nodes });

  const contents = await tx
    .insert(PostRevisionContents)
    .values({ hash, data: nodes, text, characters, images, files })
    .onConflictDoNothing({ target: PostRevisionContents.hash })
    .returning({ id: PostRevisionContents.id });

  if (contents.length > 0) {
    return contents[0].id;
  }

  const [content] = await tx
    .select({ id: PostRevisionContents.id })
    .from(PostRevisionContents)
    .where(eq(PostRevisionContents.hash, hash));

  return content.id;
};

type GetPostViewCountParams = {
  postId: string;
  context?: Pick<Context, 'loader'>;
};

export const getPostViewCount = async ({ postId, context }: GetPostViewCountParams): Promise<number> => {
  if (context) {
    const loader = context.loader({
      name: 'Post.viewCount',
      load: async (postIds: string[]) => {
        const cached = await redis.mget(postIds.map((id) => `Post:${id}:viewCount`));
        const missedIds = postIds.filter((_, i) => !cached[i]);

        const missed =
          missedIds.length > 0
            ? R.objectify(
                await database
                  .select({ postId: PostViews.postId, count: count() })
                  .from(PostViews)
                  .where(inArray(PostViews.postId, missedIds))
                  .groupBy(PostViews.postId),
                (postView) => postView.postId,
              )
            : {};

        return postIds.map((postId, index) => {
          const cachedPostView = cached[index];
          if (cachedPostView) {
            return {
              postId,
              count: Number.parseInt(cachedPostView),
            };
          }
          const postView = missed[postId];

          redis.setex(`Post:${postId}:viewCount`, 365 * 24 * 60 * 60, postView?.count ?? 0);
          return {
            postId,
            count: postView?.count ?? 0,
          };
        });
      },
      key: (row) => row.postId,
    });

    const postView = await loader.load(postId);

    return postView.count;
  } else {
    return await useCache(
      `Post:${postId}:viewCount`,
      async () => {
        return await database
          .select({ count: count() })
          .from(PostViews)
          .where(eq(PostViews.postId, postId))
          .then((rows) => rows[0].count);
      },
      365 * 24 * 60 * 60,
    );
  }
};

export const calculatePostReputation = async (postId: string) =>
  useCache(
    `Post:${postId}:reputation`,
    async () => {
      const [viewCount, purchasedCount] = await Promise.all([
        getPostViewCount({ postId }),
        database
          .select({ count: count() })
          .from(PostPurchases)
          .where(eq(PostPurchases.postId, postId))
          .then((row) => row[0].count),
      ]);

      // rank_feature는 0이면 박살남
      return viewCount + purchasedCount * 20 + 1;
    },
    600,
  );

export const calculateCollectionReputation = async (collectionId: string) =>
  useCache(
    `SpaceCollection:${collectionId}:reputation`,
    async () => {
      return await database
        .select({ postId: SpaceCollectionPosts.postId })
        .from(SpaceCollectionPosts)
        .where(eq(SpaceCollectionPosts.collectionId, collectionId))
        .then((rows) => rows.map((row) => row.postId))
        .then((postIds) => Promise.all(postIds.map((postId) => calculatePostReputation(postId))))
        .then((reputations) => reputations.reduce((a, b) => a + b, 0) / Math.sqrt(reputations.length));
    },
    600,
  );

export const defragmentSpaceCollectionPosts = async (tx: Transaction, collectionId: string) => {
  const posts = await tx
    .select({ id: SpaceCollectionPosts.id })
    .from(SpaceCollectionPosts)
    .where(eq(SpaceCollectionPosts.collectionId, collectionId))
    .orderBy(asc(SpaceCollectionPosts.order));

  for (const [order, { id }] of posts.entries()) {
    await tx.update(SpaceCollectionPosts).set({ order }).where(eq(SpaceCollectionPosts.id, id));
  }
};

export const getPostContentState = async (postId: string) => {
  const states = await database
    .select({ update: PostContentStates.update, vector: PostContentStates.vector, upToSeq: PostContentStates.upToSeq })
    .from(PostContentStates)
    .where(eq(PostContentStates.postId, postId));

  if (states.length === 0) {
    throw new Error('Post content state not found');
  }

  const [state] = states;

  const pendingUpdates = await database
    .select({ data: PostContentUpdates.data })
    .from(PostContentUpdates)
    .where(and(eq(PostContentUpdates.postId, postId), gt(PostContentUpdates.seq, state.upToSeq)));

  if (pendingUpdates.length === 0) {
    return {
      update: state.update,
      vector: state.vector,
    };
  }

  const updatedUpdate = Y.mergeUpdatesV2([state.update, ...pendingUpdates.map(({ data }) => data)]);
  const updatedVector = Y.encodeStateVectorFromUpdateV2(updatedUpdate);

  return {
    update: updatedUpdate,
    vector: updatedVector,
  };
};
