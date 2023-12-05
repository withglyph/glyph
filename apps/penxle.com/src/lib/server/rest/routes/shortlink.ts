import { status } from 'itty-router';
import { base36To10 } from '$lib/utils';
import { createRouter } from '../router';
import type { IRequest } from 'itty-router';

export const shortlink = createRouter();

shortlink.get('/shortlink/:shortlink', async (request, { db }) => {
  const shortlink = (request as IRequest).params.shortlink;
  if (!shortlink) {
    throw new Error('link is required');
  }

  const permalink = base36To10(shortlink);

  const post = await db.post.findUnique({
    select: { space: { select: { slug: true } } },
    where: { permalink },
  });

  if (!post) {
    return status(307, { headers: { Location: `/404` } });
  }

  return status(307, {
    headers: {
      Location: `/${post.space.slug}/${permalink}`,
    },
  });
});
