import { setupMixpanel } from '$lib/analytics';
import { setupGlobals } from './common';

export { handleError } from './common';

setupGlobals();
setupMixpanel();
