import { createRequest } from '@urql/core';
import { filter, map, pipe, subscribe, tap } from 'wonka';
import { getClient } from '../../client/internal';
import type { AnyVariables } from '@urql/core';
import type { $StoreSchema, StoreSchema } from '../../types';

type Kind = 'subscription';
export type SubscriptionStore<T extends $StoreSchema<Kind>> = {
  subscribe: T['$input'] extends Record<string, never> ? () => () => void : (variables: T['$input']) => () => void;
  on: (event: 'data', handler: (data: T['$output']) => void) => void;
};

export const createSubscriptionStore = <T extends $StoreSchema<Kind>>(schema: StoreSchema<T>): SubscriptionStore<T> => {
  const handlers = new Set<(data: unknown) => void>();

  const subscribe_ = (variables?: T['$input']) => {
    const { client, transformError } = getClient();

    const request = createRequest(schema.source, variables as AnyVariables);
    const operation = client.createRequestOperation('subscription', request, {
      requestPolicy: 'network-only',
    });

    const { unsubscribe } = pipe(
      client.executeRequestOperation(operation),
      filter(({ stale }) => !stale),
      tap((result) => {
        if (result.error?.networkError) {
          throw transformError(result.error.networkError);
        }

        if (result.error?.graphQLErrors.length) {
          throw transformError(result.error.graphQLErrors[0]);
        }
      }),
      map(({ data }) => data),
      subscribe((data) => {
        for (const handler of handlers) handler(data);
      }),
    );

    return unsubscribe;
  };

  const on = (event: 'data', handler: (data: unknown) => void) => {
    if (event === 'data') handlers.add(handler);
  };

  return { subscribe: subscribe_, on };
};
