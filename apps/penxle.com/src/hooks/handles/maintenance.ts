import { redis } from '$lib/server/cache';
import type { Handle } from '@sveltejs/kit';

export const maintenance = (async ({ event, resolve }) => {
  if (event.route.id === '/_internal/under-maintenance') {
    return await resolve(event);
  }

  if (event.route.id?.startsWith('/api/') && event.route.id !== '/api/graphql') {
    return await resolve(event);
  }

  const flag = await redis.get('under-maintenance');
  if (flag) {
    return await event.fetch('/_internal/under-maintenance');
  }

  return await resolve(event);
}) satisfies Handle;
