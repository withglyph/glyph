import { Client, subscriptionExchange } from '@urql/core';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { createClient as createSSEClient } from 'graphql-sse';
import { fetchExchange } from './exchanges/fetch';
import type { Exchange } from '@urql/core';
import type { CacheExchangeOpts } from '@urql/exchange-graphcache';
import type { RequestParams } from 'graphql-sse';
import type { GlitchClient } from '../types';

type CreateClientParams<E> = {
  url: string;
  cache: CacheExchangeOpts;
  transformError: (error: unknown) => E;
  onMutationError: (error: E) => void;
};

export const createClient = <E>({ url, cache, ...rest }: CreateClientParams<E>) => {
  return (isClient: boolean): GlitchClient<E> => {
    const sseClient = createSSEClient({
      url,
      retry: () => new Promise((resolve) => setTimeout(resolve, 500)),
      retryAttempts: Number.POSITIVE_INFINITY,
    });

    const exchanges: Exchange[] = [];

    if (isClient) {
      exchanges.push(devtoolsExchange);
    }

    exchanges.push(
      cacheExchange(cache),
      fetchExchange,
      subscriptionExchange({
        forwardSubscription: (operation) => {
          return {
            subscribe: (sink) => {
              const unsubscribe = sseClient.subscribe(operation as RequestParams, sink);
              return { unsubscribe };
            },
          };
        },
      }),
    );

    return {
      client: new Client({ url, exchanges }),
      ...rest,
    };
  };
};
