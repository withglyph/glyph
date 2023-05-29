import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$lib/server/routers';

export const createTRPCClient = (fetch: typeof globalThis.fetch) => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api',
        fetch,
      }),
    ],
  });
};

export const trpc = createTRPCClient(fetch);
export type TRPCClient = typeof trpc;
