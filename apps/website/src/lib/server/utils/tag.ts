import { and, count, eq } from 'drizzle-orm';
import * as R from 'radash';
import { useCache } from '../cache';
import { database, Posts, PostTags, TagFollows } from '../database';

export const getTagUsageCount = (tagId: string) => {
  return useCache(
    `Tag:${tagId}:usageCount`,
    async () => {
      const results = await database
        .select({ kind: PostTags.kind, count: count() })
        .from(PostTags)
        .innerJoin(Posts, eq(Posts.id, PostTags.postId))
        .where(and(eq(PostTags.tagId, tagId), eq(Posts.state, 'PUBLISHED')))
        .groupBy(PostTags.kind);

      return R.objectify(
        results,
        (r) => r.kind,
        (r) => r.count,
      );
    },
    60 * 60,
  );
};

export const getFollowingTagIds = async (userId?: string) => {
  if (!userId) {
    return [];
  }

  return await database
    .select({ tagId: TagFollows.tagId })
    .from(TagFollows)
    .where(eq(TagFollows.userId, userId))
    .then((rows) => rows.map((row) => row.tagId));
};
