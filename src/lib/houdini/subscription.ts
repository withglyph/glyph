import { createClient } from 'graphql-sse';
import type { SubscriptionHandler } from '$houdini/plugins';

type SseOptions = {
  url: string;
};

export const sse = (options: SseOptions): SubscriptionHandler => {
  return () => createClient({ url: options.url });
};
