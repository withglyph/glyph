/* eslint-disable no-unused-vars */

import type { PortableAppError } from '$lib/errors';

declare global {
  namespace App {
    interface Error extends PortableAppError {}
  }
}
