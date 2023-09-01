import { sequence } from '@sveltejs/kit/hooks';
import { setupGlobals } from './common';
import { logging, sentry } from './handles';

export { handleError } from './common';

setupGlobals();

export const handle = sequence(sentry, logging);
