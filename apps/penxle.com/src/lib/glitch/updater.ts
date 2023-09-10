import type { Data } from '@urql/exchange-graphcache';
import type { Cache } from '$glitch';

export const updates: Cache['updates'] = {
  Mutation: {
    createSpace: (_, __, cache) => {
      const me = cache.resolve('Query', 'meOrNull') as Data;
      cache.invalidate(me, 'spaces');
    },
    deleteSpace: (_, { input }, cache) => {
      cache.invalidate({ __typename: 'Space', id: input.spaceId });
    },
  },
};
