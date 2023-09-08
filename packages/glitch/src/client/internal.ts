import { browser } from '$app/environment';
import type { GlitchClient } from '../types';

let client: GlitchClient | undefined;
export const getClient = async (): Promise<GlitchClient> => {
  if (!browser) {
    return await createClient();
  }

  if (!client) {
    client = await createClient();
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return client!;
};

const createClient = async () => {
  const factory = await import('$glitch/client').then(($) => $.default);
  return factory();
};

export const deleteClient = () => {
  client = undefined;
};
