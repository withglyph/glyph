/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { RequestContext } from '@vercel/edge';
import type { PortableAppError } from '$lib/errors';
import type { Task } from '$lib/server/task';

declare global {
  namespace App {
    interface Error extends PortableAppError {}

    interface Locals {
      ipAddress: string;
      runTask: (task: Task) => void;
    }

    interface Platform {
      context: RequestContext;
    }
  }
}
