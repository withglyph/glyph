/* eslint-disable no-unused-vars */

import type { PortableAppError } from '$lib/errors';

declare global {
  namespace App {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Error extends PortableAppError {}
  }
}
