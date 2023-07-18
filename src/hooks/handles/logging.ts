import { logger } from '$lib/server/logging';
import type { Handle } from '@sveltejs/kit';

export const logging = (async ({ event, resolve }) => {
  logger.info(`${event.request.method} ${event.url.pathname}`, {
    scope: 'http',
    ip: event.getClientAddress(),
    ua: event.request.headers.get('user-agent') ?? undefined,
    method: event.request.method,
    path: event.url.pathname,
  });

  return await resolve(event);
}) satisfies Handle;
