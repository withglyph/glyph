import { Client, fetchExchange } from '@urql/core';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
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
      exchanges.push(devtoolsExchange);
    }

    exchanges.push(cacheExchange(cache), fetchExchange);

    return {
      client: new Client({ url, exchanges }),
      ...rest,
    };
  };
};
