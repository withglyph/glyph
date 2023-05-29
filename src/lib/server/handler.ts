import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './routers';
import type { RequestEvent } from '@sveltejs/kit';

export const handler = async (event: RequestEvent) => {
  return fetchRequestHandler({
    endpoint: '/api',
    req: event.request,
    router: appRouter,
    createContext: () => ({}),
  });
};
