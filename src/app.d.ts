/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { PortableAppError } from '$lib/errors';

declare global {
  namespace App {
    interface Error extends PortableAppError {}

    interface Locals {
      ipAddress: string;
    }
  }
}
