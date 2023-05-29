import { db } from '$lib/server/database';
import { publicProcedure, router } from '../trpc';

export const testRouter = router({
  /**
   * * Queries
   */

  greeting: publicProcedure.query(() => {
    console.log('greet');
    return 'Hello world!';
  }),

  db: publicProcedure.query(async () => {
    const result = await db.user.findFirstOrThrow();
    return result.id;
  }),

  /**
   * * Mutations
   */

  noop: publicProcedure.mutation(() => {
    return 'no-op mutation';
  }),
});
