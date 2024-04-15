import 'unplugin-icons/types/svelte';

import type { PortableAppError } from '$lib/errors';

declare global {
  namespace App {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-interface
    interface Error extends PortableAppError {}
  }
}
