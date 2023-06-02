import { createYoga } from 'graphql-yoga';
import { extendContext } from './context';
import { useErrorHandling } from './plugins';
import { schema } from './schemas';
import type { RequestEvent } from '@sveltejs/kit';

export const handler = createYoga<RequestEvent>({
  schema,
  context: extendContext,
  fetchAPI: globalThis,
  graphqlEndpoint: '/api/graphql',
  maskedErrors: false,
  plugins: [useErrorHandling()],
});
