import {
  cacheExchange,
  createClient,
  fetchExchange,
  resetExchange,
} from '@penxle/glitch';
import schema from '$glitch/introspection.json';
import { deserializeGraphQLError } from '$lib/errors';
import type { StorageAdapter } from '@urql/exchange-graphcache';
import type { Cache } from '$glitch';

// eslint-disable-next-line import/no-default-export
export default () =>
  createClient({
    url: '/api/graphql',
    exchanges: [
      resetExchange(),
      cacheExchange<Cache>({
        schema,
        storage: undefined as unknown as StorageAdapter,
      }),
      fetchExchange,
    ],
    errorHandler: deserializeGraphQLError,
  });
