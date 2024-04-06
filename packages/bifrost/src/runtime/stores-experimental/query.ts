import { GraphQLClient } from 'graphql-request';
import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import { cache } from '../../cache/cache';
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
    const client = new GraphQLClient('/api/graphql');
    const setters = new Set<(v: T['$output']) => void>();

    const store = readable<StoreOutput<T>>(undefined, (set) => {
      setters.add(set);
      return () => {
        setters.delete(set);
      };
    });

    return Object.assign(store, {
      refetch: async (variables?: T['$input']) => {
        const resp = await client.request<T['$output']>({
          document: schema.source,
          variables: variables ?? undefined,
        });

        for (const set of setters) {
          set(resp);
        }

        return resp;
      },
    });
  } else {
    return async (fetch: typeof globalThis.fetch, variables?: T['$input']): Promise<QueryStore<T>> => {
      const client = new GraphQLClient('/api/graphql', { fetch });

      const data = await client.request<T['$output']>({
        document: schema.source,
        variables: variables ?? undefined,
      });

      let store;
      if (browser) {
        cache.writeQuery(schema.name, variables ?? {}, data);
        store = cache.readQuery<StoreOutput<T>>(schema.name, variables ?? {});
      } else {
        store = readable<StoreOutput<T>>(data);
      }

      return Object.assign(store, {
        refetch: async (newVariables?: T['$input']) => {
          return await client.request<T['$output']>({
            document: schema.source,
            variables: variables ?? newVariables ?? undefined,
          });
        },
      });
    };
  }
};
