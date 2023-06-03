import { derived } from 'svelte/store';
import { invalidateAll } from '$app/navigation';
import { cache } from '$houdini';
import type { GraphQLObject, GraphQLVariables, QueryStore } from '$houdini';

export const unwrap = <D extends GraphQLObject, I extends GraphQLVariables>(
  store: QueryStore<D, I>
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return derived(store, ($store) => $store.data as D);
};

export const refreshAll = async () => {
  cache.markStale();
  await invalidateAll();
};
