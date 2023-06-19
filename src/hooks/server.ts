import * as Sentry from '@sentry/sveltekit';
import { json } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { get } from '@vercel/edge-config';
import { enabled } from '$lib/features';
import { setupGlobals } from './common';
import type { Handle } from '@sveltejs/kit';

export { handleError } from './common';

setupGlobals();

const _handle = (async ({ event, resolve }) => {
  if (!['GET', 'POST'].includes(event.request.method)) {
    return new Response(null, { status: 405 });
  }

  if (
    enabled('under-maintenance') &&
    event.route.id !== '/_/internal/under-maintenance'
  ) {
    const allowlistedIps = await get<string[]>('allowlisted-ips');
    if (!allowlistedIps?.includes(event.getClientAddress())) {
      return event.route.id?.startsWith('/api')
        ? json({ code: 'under_maintenance' })
        : await event.fetch('/_/internal/under-maintenance');
    }
  }

  return await resolve(event);
}) satisfies Handle;

export const handle = sequence(Sentry.sentryHandle(), _handle);
