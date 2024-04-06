import type { Handle } from '@sveltejs/kit';

export const headers = (async ({ event, resolve }) => {
  return await resolve(event, {
    filterSerializedResponseHeaders: (name) => {
      if (name === 'content-type') {
        return true;
      }

      return false;
    },
  });
}) satisfies Handle;
