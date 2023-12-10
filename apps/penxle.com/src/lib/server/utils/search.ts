import { openSearch } from '../search';
import type { InteractiveTransactionClient } from '../database';

type IndexPostParams = {
  db: InteractiveTransactionClient;
  postId: string;
};

export const indexPost = async ({ db, postId }: IndexPostParams) => {
  const post = await db.post.findUniqueOrThrow({
    include: {
      publishedRevision: {
        include: {
          tags: {
            include: { tag: true },
          },
        },
      },
    },
    where: { id: postId },
  });

  if (post.publishedRevision) {
    if (post.visibility === 'PUBLIC' && post.password === null) {
      await openSearch.index({
        index: 'posts',
        id: post.id,
        body: {
          title: post.publishedRevision.title,
          subtitle: post.publishedRevision.subtitle,
          publishedAt: post.publishedAt?.getTime() ?? Date.now(),
          tags: post.publishedRevision.tags.map(({ tag }) => ({ id: tag.id, name: tag.name })),
          spaceId: post.spaceId,
        },
      });
    } else {
      await openSearch.delete({
        index: 'posts',
        id: post.id,
      });
    }
  }
};
