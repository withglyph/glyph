import { derived } from 'svelte/store';
import type {
  GraphQLObject,
  GraphQLVariables,
  QueryResult,
  QueryStore,
} from '$houdini';
import type { Readable } from 'svelte/store';

export const useQuery = <D extends GraphQLObject, I extends GraphQLVariables>(
  store: QueryStore<D, I>
): Readable<D> => {
  return derived(store, ($store: QueryResult<D, I>) => $store.data!);
};
