import { json } from '@sveltejs/kit';
import { enabled } from '$lib/features';
import { setupGlobals } from './common';
import type { Handle, RequestEvent } from '@sveltejs/kit';

export { handleError } from './common';

setupGlobals();

const populateLocals = (event: RequestEvent): App.Locals => {
  return {
    ipAddress: event.getClientAddress(),
  };
};

export const handle = (async ({ event, resolve }) => {
  event.locals = populateLocals(event);

  if (event.request.method === 'OPTIONS') {
    return new Response(null, { status: 405 });
  }

  if (
    enabled('under-maintenance') &&
    event.route.id !== '/_/internal/under-maintenance'
  ) {
    return event.route.id?.startsWith('/api')
      ? json({ code: 'under_maintenance' })
      : await event.fetch('/_/internal/under-maintenance');
  }

  return await resolve(event);
}) satisfies Handle;
