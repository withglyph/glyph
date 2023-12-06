import { Client } from '@urql/core';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { fetchExchange } from './exchanges/fetch';
import { refetchExchange, signalRefetch } from './exchanges/refetch';
import type { Exchange } from '@urql/core';
import type { CacheExchangeOpts } from '@urql/exchange-graphcache';
import type { GlitchClient } from '../types';

type CreateClientParams = {
  url: string;
  cache: CacheExchangeOpts;
  transformError: (error: unknown) => Error;
  onMutationError: (error: Error) => void;
};

export const createClient = ({ url, cache, ...rest }: CreateClientParams) => {
  return (isClient: boolean): GlitchClient => {
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
