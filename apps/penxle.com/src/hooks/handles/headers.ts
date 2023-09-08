import type { Handle } from '@sveltejs/kit';

export const headers = (async ({ event, resolve }) => {
  return await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-type',
  });
}) satisfies Handle;
