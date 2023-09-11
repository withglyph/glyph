import type { Cache, Data } from '@urql/exchange-graphcache';
import type { GraphCacheConfig } from '$glitch';

const me = (cache: Cache) => cache.resolve('Query', 'me') as Data;

export const updates: GraphCacheConfig['updates'] = {
  Mutation: {
    createSpace: (_, __, cache) => {
      cache.invalidate(me(cache), 'spaces');
    },
    deleteSpace: (_, { input }, cache) => {
      cache.invalidate({ __typename: 'Space', id: input.spaceId });
    },
  },
};
