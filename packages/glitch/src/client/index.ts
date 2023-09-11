import { Client, fetchExchange } from '@urql/core';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { refetchExchange, signalRefetch } from './exchanges/refetch';
import type { Exchange } from '@urql/core';
import type { CacheExchangeOpts } from '@urql/exchange-graphcache';
import type { GlitchClient } from '../types';

type CreateClientParams = {
  url: string;
  cache: CacheExchangeOpts;
  onError: (error: unknown) => Error;
};

export const createClient = ({ url, cache, onError }: CreateClientParams) => {
  return (isClient: boolean): GlitchClient => {
    const exchanges: Exchange[] = [];

    if (isClient) {
      exchanges.push(devtoolsExchange, refetchExchange);
    }

    exchanges.push(cacheExchange(cache), fetchExchange);

    return {
      client: new Client({
        url,
        exchanges,
      }),
      onError,
    };
  };
};

export const refetchAllQueries = () => {
  signalRefetch();
};
