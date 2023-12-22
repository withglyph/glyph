import { Client } from '@urql/core';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { fetchExchange } from './exchanges/fetch';
import { refetchExchange, signalRefetch } from './exchanges/refetch';
import type { Exchange } from '@urql/core';
import type { CacheExchangeOpts } from '@urql/exchange-graphcache';
import type { GlitchClient } from '../types';

type CreateClientParams<E> = {
  url: string;
  cache: CacheExchangeOpts;
  transformError: (error: unknown) => E;
  onMutationError: (error: E) => void;
};

export const createClient = <E>({ url, cache, ...rest }: CreateClientParams<E>) => {
  return (isClient: boolean): GlitchClient<E> => {
    const exchanges: Exchange[] = [];

    if (isClient) {
      exchanges.push(devtoolsExchange, refetchExchange);
    }

    exchanges.push(cacheExchange(cache), fetchExchange);

    return {
      client: new Client({ url, exchanges }),
      ...rest,
    };
  };
};

export const refetchAllQueries = () => {
  signalRefetch();
};
