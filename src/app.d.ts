/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { TRPCClient } from '$lib/api';
import type { PortableAppError } from '$lib/errors';

declare global {
  namespace App {
    interface Error extends PortableAppError {}

    interface Locals {
      trpc: TRPCClient;
      ipAddress: string;
    }
  }
}
