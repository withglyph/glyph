// warm up the server handlers
import '$lib/server/graphql/handler';
import '$lib/server/rest/handler';

import { sequence } from '@sveltejs/kit/hooks';
import { setupGlobals } from './common';
import { headers, logging, sentry } from './handles';

export { handleError } from './common';

setupGlobals();

export const handle = sequence(sentry, logging, headers);
