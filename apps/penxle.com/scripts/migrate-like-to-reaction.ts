import { prismaClient } from '$lib/server/database';
import { createId } from '$lib/utils';

for (let i = 0; ; i++) {
  const likes = await prismaClient.postLike.findMany({
    take: 100,
  });

  if (likes.length === 0) {
    break;
  }

  await Promise.all(
    likes.map((like) =>
      prismaClient.postReaction.upsert({
        where: {
          postId_userId_emoji: {
            postId: like.postId,
            userId: like.userId,
            emoji: 'heart',
          },
        },
        create: {
          id: createId(),
          postId: like.postId,
          userId: like.userId,
          emoji: 'heart',
          createdAt: like.createdAt,
        },
        update: {},
      }),
    ),
  );

  await prismaClient.postLike.deleteMany({
    where: {
      id: {
        in: likes.map((like) => like.id),
      },
    },
  });

  console.log(`Migrated ${i * 100 + likes.length} likes`);
}
