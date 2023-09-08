import { browser } from '$app/environment';
import type { GlitchClient } from '../types';

let client: GlitchClient;
export const getClient = async (): Promise<GlitchClient> => {
  if (!browser) {
    return await createClient();
  }

  if (!client) {
    client = await createClient();
  }

  return client;
};

const createClient = async () => {
  const factory = await import('$glitch/client').then(($) => $.default);
  return factory();
};
