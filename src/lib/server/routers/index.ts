import { router } from '../trpc';
import { testRouter } from './test';

export type AppRouter = typeof appRouter;
export const appRouter = router({
  test: testRouter,
});
