import { json } from '@sveltejs/kit';
import { ipAddress } from '@vercel/edge';
import { enabled } from '$lib/features';
import { createInternalApi } from '$lib/server/internal/client';
import { createTaskRunner } from '$lib/server/task';
import { setupGlobals } from './common';
import type { Handle, RequestEvent } from '@sveltejs/kit';

export { handleError } from './common';

setupGlobals();

const populateLocals = (event: RequestEvent): App.Locals => {
  return {
    ipAddress: ipAddress(event.request) ?? event.getClientAddress(),
    runTask: createTaskRunner(event),

    internalApi: createInternalApi(event.fetch),
  };
};

export const handle = (async ({ event, resolve }) => {
  event.locals = populateLocals(event);

  if (event.request.method === 'OPTIONS') {
    return new Response(null, { status: 405 });
  }

  if (
    enabled('under-maintenance') &&
    event.route.id !== '/_internal/under-maintenance'
  ) {
    return event.route.id?.startsWith('/api')
      ? json({ code: 'under_maintenance' })
      : await event.fetch('/_internal/under-maintenance');
  }

  return await resolve(event);
}) satisfies Handle;
