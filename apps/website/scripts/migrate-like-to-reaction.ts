import { database, inArray, PostLikes, PostReactions } from '$lib/server/database';

for (let i = 0; ; i++) {
  const likes = await database.select().from(PostLikes).limit(100);

  if (likes.length === 0) {
    break;
  }

  await database
    .insert(PostReactions)
    .values(
      likes.map((like) => ({
        postId: like.postId,
        userId: like.userId,
        emoji: 'heart',
        createdAt: like.createdAt,
      })),
    )
    .onConflictDoNothing();

  await database.delete(PostLikes).where(
    inArray(
      PostLikes.id,
      likes.map((like) => like.id),
    ),
  );

  console.log(`Migrated ${i * 100 + likes.length} likes to reactions`);
}

console.log('Migration complete');
