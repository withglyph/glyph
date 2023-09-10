import { createClient, resetExchange } from '@penxle/glitch';
import { fetchExchange } from '@urql/core';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import schema from '$glitch/introspection.json';
import { deserializeGraphQLError } from '$lib/errors';
import { updates } from './updater';
import type { StorageAdapter } from '@urql/exchange-graphcache';
import type { Cache } from '$glitch';

// eslint-disable-next-line import/no-default-export
export default () =>
  createClient({
    url: '/api/graphql',
    exchanges: [
      devtoolsExchange,
      resetExchange(),
      cacheExchange<Cache>({
        schema,
        updates,
        storage: undefined as unknown as StorageAdapter,
      }),
      fetchExchange,
    ],
    errorHandler: deserializeGraphQLError,
  });
