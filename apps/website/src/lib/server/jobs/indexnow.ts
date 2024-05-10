import { production } from '@withglyph/lib/environment';
import { and, eq } from 'drizzle-orm';
import { database, Posts, Spaces } from '../database';
import { indexnow } from '../external-api';
import { useFirstRow } from '../utils';
import { defineJob } from './types';

export const NotifyIndexNowJob = defineJob('notifyIndexNow', async (postId: string) => {
  if (!production) {
    return;
  }

  const post = await database
    .select({
      permalink: Posts.permalink,
      space: { slug: Spaces.slug },
    })
    .from(Posts)
    .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
    .where(
      and(
        eq(Posts.id, postId),
        eq(Posts.state, 'PUBLISHED'),
        eq(Posts.visibility, 'PUBLIC'),
        eq(Spaces.visibility, 'PUBLIC'),
      ),
    )
    .then(useFirstRow);

  if (!post) {
    return;
  }

  try {
    await indexnow.notify(`https://withglyph.com/${post.space.slug}/${post.permalink}`);
  } catch {
    // 네이버 indexnow에서 422를 너무 많이 던져서 일단 무시
  }
});
