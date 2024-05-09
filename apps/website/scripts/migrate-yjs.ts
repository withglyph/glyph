import { eq } from 'drizzle-orm';
import { database, Posts } from '$lib/server/database';
import { enqueueJob } from '$lib/server/jobs';

for (let i = 0; ; i++) {
  const posts = await database.select({ id: Posts.id }).from(Posts).where(eq(Posts.migrated, false)).limit(100);

  if (posts.length === 0) {
    break;
  }

  await Promise.all(posts.map((post) => enqueueJob('migrateYjs', post.id)));
}
