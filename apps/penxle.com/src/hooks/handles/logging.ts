import { logger } from '$lib/server/logging';
import type { Handle } from '@sveltejs/kit';

export const logging = (async ({ event, resolve }) => {
  logger.debug({
    context: 'http',
    method: event.request.method,
    path: event.url.pathname,
  });

  return await resolve(event);
}) satisfies Handle;
