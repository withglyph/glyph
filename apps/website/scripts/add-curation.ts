import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline/promises';
import { eq } from 'drizzle-orm';
import { CurationPosts, database, Posts } from '$lib/server/database';

const rl = readline.createInterface(stdin, stdout);

// eslint-disable-next-line no-constant-condition
while (true) {
  const permalink = await rl.question('input permalink: ');
  if (permalink.length === 0) {
    break;
  }

  const postId = await database
    .select({ id: Posts.id })
    .from(Posts)
    .where(eq(Posts.permalink, permalink))
    .then((rows) => rows[0]?.id);

  if (postId) {
    await database.insert(CurationPosts).values({ postId }).onConflictDoNothing();
  }
}
rl.close();
