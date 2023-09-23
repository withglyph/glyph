import { useGraphQlJit } from '@envelop/graphql-jit';
import { createYoga } from 'graphql-yoga';
import { createContext } from '../context';
import { useErrorHandling, useLogging, useTelemetry, useTransaction } from './plugins';
import { schema } from './schemas';
import type { RequestEvent } from '@sveltejs/kit';

export const handler = createYoga<RequestEvent>({
  schema,
  context: createContext,
  fetchAPI: globalThis,
  graphqlEndpoint: '/api/graphql',
  maskedErrors: false,
  plugins: [useErrorHandling(), useGraphQlJit(), useLogging(), useTelemetry(), useTransaction()],
});
