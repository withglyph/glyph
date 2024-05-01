import { browser } from '$app/environment';
import factory from '$glitch/client';
import type { GlitchClient } from '../types';

let client: GlitchClient | undefined;
export const getClient = (): GlitchClient => {
  if (!browser) {
    return factory(false);
  }

  if (client) {
    return client;
  }

  client = factory(true);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return client!;
};
