import { createYoga } from 'graphql-yoga';
import { extendContext } from './context';
import { useErrorHandling } from './plugins';
import { buildSchema } from './schemas';
import type { RequestEvent } from '@sveltejs/kit';

export const handler = createYoga<RequestEvent>({
  schema: buildSchema,
  context: extendContext,
  fetchAPI: globalThis,
  graphqlEndpoint: '/api/graphql',
  maskedErrors: false,
  plugins: [useErrorHandling()],
});
