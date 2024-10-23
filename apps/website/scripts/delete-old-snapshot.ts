/* eslint-disable unicorn/no-process-exit */
import dayjs from 'dayjs';
import { and, desc, eq, gt, lt, ne } from 'drizzle-orm';
import { database, PostContentSnapshots, Posts } from '$lib/server/database';
import { useFirstRow } from '$lib/server/utils';

let lastId = ' ';
const limit = dayjs().subtract(1, 'day');

for (let i = 0; ; i++) {
  const posts = await database
    .select({ id: Posts.id })
    .from(Posts)
    .where(gt(Posts.id, lastId))
    .orderBy(Posts.id)
    .limit(100);

  if (posts.length === 0) {
    break;
  }

  await database.transaction(async (tx) => {
    const ids = posts.map((post) => post.id);

    await Promise.all(
      ids.map(async (id) => {
        const lastSnapshot = await tx
          .select({ id: PostContentSnapshots.id })
          .from(PostContentSnapshots)
          .where(eq(PostContentSnapshots.postId, id))
          .orderBy(desc(PostContentSnapshots.createdAt))
          .limit(1)
          .then(useFirstRow);

        if (lastSnapshot) {
          await tx
            .delete(PostContentSnapshots)
            .where(
              and(
                eq(PostContentSnapshots.postId, id),
                ne(PostContentSnapshots.id, lastSnapshot.id),
                lt(PostContentSnapshots.createdAt, limit),
              ),
            );
        }
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    lastId = posts.at(-1)!.id;

    console.log(`Processed ${i} batches`);
  });
}

process.exit(0);
