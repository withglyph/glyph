import { webcrypto } from 'node:crypto';
import { asc, count, eq, inArray } from 'drizzle-orm';
import * as R from 'radash';
import { redis, useCache } from '$lib/server/cache';
import { database, PostPurchases, PostRevisionContents, PostViews, SpaceCollectionPosts } from '../database';
import { useFirstRow, useFirstRowOrThrow } from './database';
import { isEmptyContent } from './tiptap';
import type { JSONContent } from '@tiptap/core';
import type { Context } from '../context';
import type { Transaction } from '../database';

export const makePostContentId = async (data: JSONContent[] | null) => {
  if (isEmptyContent(data)) {
    return null;
  }

  const hash = Buffer.from(
    await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data))),
  ).toString('hex');

  const contentId: string =
    (await database
      .select({ id: PostRevisionContents.id })
      .from(PostRevisionContents)
      .where(eq(PostRevisionContents.hash, hash))
      .then(useFirstRow)
      .then((row) => row?.id)) ??
    (await database
      .insert(PostRevisionContents)
      .values({ hash, data })
      .returning({ id: PostRevisionContents.id })
      .then(useFirstRowOrThrow())
      .then((row) => row.id));

  return contentId;
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

export const calculatePostReputation = (postId: string) =>
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

      return viewCount + purchasedCount * 20;
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
