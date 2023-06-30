import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import { logger } from '$lib/logging';
import { setupGlobals } from './common';
import type { Handle } from '@sveltejs/kit';

export { handleError } from './common';

setupGlobals();

const _handle = (async ({ event, resolve }) => {
  logger.info({
    context: 'http',
    ip: event.getClientAddress(),
    ua: event.request.headers.get('user-agent') ?? undefined,
    method: event.request.method,
    path: event.url.pathname,
  });

  return await resolve(event);
}) satisfies Handle;

export const handle = sequence(Sentry.sentryHandle(), _handle);
