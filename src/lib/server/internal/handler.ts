import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { internalRouter } from './routers';
import type { RequestEvent } from '@sveltejs/kit';

export const handler = async (event: RequestEvent) => {
  return fetchRequestHandler({
    endpoint: '/api/internal',
    req: event.request,
    router: internalRouter,
    createContext: () => ({}),
  });
};
