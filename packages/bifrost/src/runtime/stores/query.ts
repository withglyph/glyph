import { createRequest } from '@urql/core';
import { readable } from 'svelte/store';
import { filter, makeSubject, map, pipe, subscribe, switchMap, take, toPromise } from 'wonka';
import { getClient } from '../../client/internal';
import type { AnyVariables, GraphQLRequest } from '@urql/core';
import type { Readable } from 'svelte/store';
import type { $StoreSchema, StoreSchema } from '../../types';

type StoreOutput<T extends $StoreSchema<Kind>> =
  | T['$output']
  | (T['$meta'] extends { mode: 'manual' } ? undefined : never);

type Kind = 'query';
export type QueryStore<T extends $StoreSchema<Kind>> = Readable<StoreOutput<T>> &
  (T['$input'] extends Record<string, never>
    ? { refetch: () => Promise<T['$output']> }
    : { refetch: (newVariables?: T['$input']) => Promise<T['$output']> });

export const createQueryStore = <T extends $StoreSchema<Kind>>(schema: StoreSchema<T>) => {
  if (schema.meta.mode === 'manual') {
    const { client, transformError } = getClient();

    const { source, next } = makeSubject<GraphQLRequest>();

    const store = readable<unknown>(undefined, (set) => {
      const { unsubscribe } = pipe(
        source,
        switchMap((request) => {
          const operation = client.createRequestOperation('query', request, {
            meta: { source: 'store' },
            requestPolicy: 'cache-only',
          });

          return client.executeRequestOperation(operation);
        }),
        filter(({ data }) => data),
        map(({ data }) => data),
        subscribe(set),
      );

      return unsubscribe;
    });

    return Object.assign(store, {
      refetch: async (variables?: T['$input']) => {
        const request = createRequest(schema.source, variables as AnyVariables);
        const operation = client.createRequestOperation('query', request, {
          meta: { source: 'store' },
          requestPolicy: 'network-only',
        });

        const source = client.executeRequestOperation(operation);

        const result = await pipe(
          source,
          filter(({ stale }) => !stale),
          take(1),
          toPromise,
        );

        if (result.error?.networkError) {
          throw transformError(result.error.networkError);
        }

        if (result.error?.graphQLErrors.length) {
          throw transformError(result.error.graphQLErrors[0]);
        }

        next(request);

        return result.data;
      },
    });
  } else {
    return async (fetch: typeof globalThis.fetch, variables?: T['$input']): Promise<QueryStore<T>> => {
      const { client, transformError } = getClient();

      const request = createRequest(schema.source, variables as AnyVariables);
      const operation = client.createRequestOperation('query', request, {
        fetch,
        meta: { source: 'load' },
        requestPolicy: 'network-only',
      });

      const result = await pipe(
        client.executeRequestOperation(operation),
        filter(({ stale }) => !stale),
        take(1),
        toPromise,
      );

      if (result.error?.networkError) {
        throw transformError(result.error.networkError);
      }

      if (result.error?.graphQLErrors.length) {
        throw transformError(result.error.graphQLErrors[0]);
      }

      const { source, next } = makeSubject<GraphQLRequest>();

      const store = readable(result.data, (set) => {
        const { unsubscribe } = pipe(
          source,
          switchMap((request) => {
            const operation = client.createRequestOperation('query', request, {
              meta: { source: 'store' },
              requestPolicy: 'cache-only',
            });

            return client.executeRequestOperation(operation);
          }),
          filter(({ data }) => data),
          map(({ data }) => data),
          subscribe(set),
        );

        next(request);

        return unsubscribe;
      });

      return Object.assign(store, {
        refetch: async (newVariables?: T['$input']) => {
          const request = createRequest(schema.source, (newVariables ?? variables) as AnyVariables);
          const operation = client.createRequestOperation('query', request, {
            meta: { source: 'store' },
            requestPolicy: 'network-only',
          });

          const result = await pipe(
            client.executeRequestOperation(operation),
            filter(({ stale }) => !stale),
            take(1),
            toPromise,
          );

          if (result.error?.networkError) {
            throw transformError(result.error.networkError);
          }

          if (result.error?.graphQLErrors.length) {
            throw transformError(result.error.graphQLErrors[0]);
          }

          next(request);

          return result.data;
        },
      });
    };
  }
};
