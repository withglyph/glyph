import type { RequestEvent } from '@sveltejs/kit';
import type { Awaitable } from '$lib/types';

export const createTaskRunner =
  (event: RequestEvent) => (task: Awaitable<void>) => {
    if (typeof task === 'function') {
      task = task();
    }

    if (event.platform) {
      event.platform.context.waitUntil(task);
    }
  };
