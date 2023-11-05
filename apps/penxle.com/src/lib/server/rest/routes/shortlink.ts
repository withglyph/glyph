import { status } from 'itty-router';
import { createRouter } from '../router';
import type { IRequest } from 'itty-router';

export const shortlink = createRouter();

shortlink.get('/shortlink/:shortlink', async (request, { db }) => {
  const shortlink = (request as IRequest).params.shortlink;
  if (!shortlink) {
    throw new Error('link is required');
  }

  const post = await db.post.findUnique({
    select: { permalink: true, space: { select: { slug: true } } },
    where: { shortlink },
  });

  if (!post) {
    return status(307, { headers: { Location: `/404` } });
  }

  return status(307, {
    headers: {
      Location: `/${post.space.slug}/${post.permalink}`,
    },
  });
});
