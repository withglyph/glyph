import init, { greet } from '@penxle/wasm';
import { db } from '$lib/server/database';
import { builder } from '../builder';

/**
 * * Queries
 */

builder.queryFields((t) => ({
  greeting: t.string({
    resolve: async () => {
      await init();
      return greet('Hello world!');
    },
  }),

  db: t.string({
    resolve: async () => {
      const result = await db
        .selectFrom('users')
        .select(['id'])
        .executeTakeFirstOrThrow();
      return result.id;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  noop: t.string({
    resolve: () => {
      return 'no-op mutation';
    },
  }),
}));

/**
 * * Subscriptions
 */

builder.subscriptionFields((t) => ({
  countdown: t.int({
    subscribe: async function* () {
      for (let index = 10_000; index >= 0; index--) {
        yield index;
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
      }
    },
    resolve: (parent) => parent,
  }),
}));
