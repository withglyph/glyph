import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
// import { isUnderMaintenance } from '$lib/server/external/vercel';
import { setupGlobals } from './common';
import type { Handle } from '@sveltejs/kit';

export { handleError } from './common';

setupGlobals();

const _handle = (async ({ event, resolve }) => {
  if (!['GET', 'POST'].includes(event.request.method)) {
    return new Response(null, { status: 405 });
  }

  // if (await isUnderMaintenance(event)) {
  //   return await event.fetch('/_/internal/under-maintenance', event.request);
  // }

  return await resolve(event);
}) satisfies Handle;

export const handle = sequence(Sentry.sentryHandle(), _handle);
