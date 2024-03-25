import { webcrypto } from 'node:crypto';
import { count, eq } from 'drizzle-orm';
import { useCache } from '$lib/server/cache';
import { createId } from '$lib/utils';
import { database, PostRevisionContents, PostViews } from '../database';
import { useFirstRowOrThrow } from './database';
import type { JSONContent } from '@tiptap/core';

type RevisePostContentParams = {
  contentData: JSONContent[];
};

export const revisePostContent = async ({ contentData }: RevisePostContentParams) => {
  const contentHash = Buffer.from(
    await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(contentData))),
  ).toString('hex');

  return await database
    .insert(PostRevisionContents)
    .values({
      id: createId(),
      hash: contentHash,
      data: contentData,
    })
    .onConflictDoNothing({ target: PostRevisionContents.hash })
    .returning()
    .then(useFirstRowOrThrow());
};

type GetPostViewCountParams = {
  postId: string;
};
export const getPostViewCount = ({ postId }: GetPostViewCountParams) =>
  useCache(
    `Post:${postId}:viewCount`,
    async () => {
      const [{ postViewCount }] = await database
        .select({ postViewCount: count() })
        .from(PostViews)
        .where(eq(PostViews.postId, postId));
      return postViewCount;
    },
    365 * 24 * 60 * 60,
  );
