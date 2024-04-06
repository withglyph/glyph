import type { $StoreSchema, StoreSchema } from '../../types';

type Kind = 'subscription';
export type SubscriptionStore<T extends $StoreSchema<Kind>> = {
  subscribe: T['$input'] extends Record<string, never> ? () => () => void : (variables: T['$input']) => () => void;
  on: (event: 'data', handler: (data: T['$output']) => void) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createSubscriptionStore = <T extends $StoreSchema<Kind>>(schema: StoreSchema<T>): SubscriptionStore<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {} as any;
};
