import { range } from 'radash';
import { createRandomAvatar } from '$lib/server/utils/avatar';
import { builder } from '../builder';

/**
 * * Queries
 */

builder.queryFields((t) => ({
  randomAvatars: t.stringList({
    resolve: () => {
      return [...range(1, 16)].map(() => createRandomAvatar());
    },
  }),
}));
