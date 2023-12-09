import { useGraphQlJit } from '@envelop/graphql-jit';
import { createYoga } from 'graphql-yoga';
import { createContext } from '../context';
import { useContextFinalizer, useErrorHandling, useLogging, useTelemetry } from './plugins';
import { schema } from './schemas';
import type { RequestEvent } from '@sveltejs/kit';

export const handler = createYoga<RequestEvent>({
  schema,
  context: createContext,
  fetchAPI: { Response },
  graphqlEndpoint: '/api/graphql',
  batching: true,
  maskedErrors: false,
  plugins: [useGraphQlJit(), useErrorHandling(), useLogging(), useTelemetry(), useContextFinalizer()],
});
