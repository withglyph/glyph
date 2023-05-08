import { t } from '../trpc';
import { passwordRouter } from './password';

export const internalRouter = t.mergeRouters(passwordRouter);
export type InternalRouter = typeof internalRouter;
