import { setupMixpanel } from '$lib/analytics';
import { setupChannelIO } from '$lib/channel.io';
import { setupGlobals } from './common';

export { handleError } from './common';

setupGlobals();
setupMixpanel();
setupChannelIO();
