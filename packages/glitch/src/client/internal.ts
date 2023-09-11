import { browser } from '$app/environment';
import type { GlitchClient } from '../types';

let clientPromise: Promise<GlitchClient> | undefined;
export const getClient = async (): Promise<GlitchClient> => {
  if (!browser) {
    return await createClient(false);
  }

  if (!clientPromise) {
    clientPromise = createClient(true);
  }

  return await clientPromise;
};

const createClient = async (isClient: boolean) => {
  const factory = await import('$glitch/client').then(($) => $.default);
  return factory(isClient);
};
