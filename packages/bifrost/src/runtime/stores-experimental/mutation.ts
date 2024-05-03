import { GraphQLClient } from 'graphql-request';
import { readable } from 'svelte/store';
import { cache } from '../../cache/cache';
import type { Readable } from 'svelte/store';
import type { $StoreSchema, StoreSchema } from '../../types';

type Kind = 'mutation';
export type MutationStore<T extends $StoreSchema<Kind>> = Readable<{ inflight: boolean }> &
  (T['$input'] extends Record<string, never>
    ? () => Promise<T['$output'][keyof T['$output']]>
    : (input: T['$input'] extends { input: infer U } ? U : never) => Promise<T['$output'][keyof T['$output']]>);

export const createMutationStore = <T extends $StoreSchema<Kind>>(schema: StoreSchema<T>): MutationStore<T> => {
  const store = readable<{ inflight: boolean }>({ inflight: false });

  const mutate = async (input?: T['$input'] extends { input: infer U } ? U : never) => {
    const client = new GraphQLClient('/api/graphql', { fetch });

    const data = await client.request<T['$output']>({
      document: schema.source,
      variables: input ? { input } : undefined,
    });

    cache.writeMutation(data);

    return data[Object.keys(data as never)[0] as keyof typeof data] as T['$output'][keyof T['$output']];
  };

  return Object.assign(mutate, store);
};
