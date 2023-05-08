import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { InternalRouter } from './routers';

export const createInternalApi = (fetch: typeof globalThis.fetch) => {
  return createTRPCProxyClient<InternalRouter>({
    links: [
      httpLink({
        url: '/api/internal',
        fetch,
      }),
    ],
  });
};

export type InternalApi = ReturnType<typeof createInternalApi>;
