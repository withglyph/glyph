import { sequence } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/environment';
import { setupGlobals } from './common';
import { headers, logging, sentry } from './handles';

export { handleError } from './common';

setupGlobals();

export const handle = sequence(sentry, logging, headers);

// warm up the server handlers
if (!dev && !building) {
  await import('$lib/server/graphql/handler');
  await import('$lib/server/rest/handler');
}
