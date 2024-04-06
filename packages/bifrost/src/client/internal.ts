import { browser } from '$app/environment';
import factory from '$bifrost/client';
import type { BifrostClient } from '.';

let client: BifrostClient | undefined;
export const getClient = (): BifrostClient => {
  if (!browser) {
    return factory();
  }

  client ??= factory();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return client!;
};
