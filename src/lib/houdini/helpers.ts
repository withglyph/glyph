import { derived } from 'svelte/store';
import { AppError } from '$lib/errors';
import { toast } from '$lib/notification';
import type {
  GraphQLObject,
  GraphQLVariables,
  MutationStore,
  QueryStore,
} from '$houdini';
import type { Unwrap } from '$lib/types';
import type { Readable } from 'svelte/store';

type UseQueryReturn<D extends GraphQLObject> = Readable<D> & {
  refetch: () => Promise<void>;
};

type Mutate<D extends GraphQLObject> = () => Promise<Unwrap<D>>;
type ParameterizedMutate<D extends GraphQLObject, V> = (
  input: V
) => Promise<Unwrap<D>>;
type UseMutationReturn<
  D extends GraphQLObject,
  I extends { input: GraphQLVariables } | null
> = (I extends { input: infer V } ? ParameterizedMutate<D, V> : Mutate<D>) &
  Readable<{ inflight: boolean }>;

export const useQuery = <D extends GraphQLObject, I extends GraphQLVariables>(
  store: QueryStore<D, I>
): UseQueryReturn<D> => {
  const { subscribe } = derived(store, ($store) => $store.data!);

  return {
    subscribe,
    refetch: async () => {
      await store.fetch();
    },
  };
};

export const useMutation = <
  D extends GraphQLObject,
  V extends GraphQLVariables,
  I extends { input: V } | null,
  O extends GraphQLObject
>(
  store: MutationStore<D, I, O>
): UseMutationReturn<D, I> => {
  const mutate = (async (input?: V) => {
    try {
      const { data } = await store.mutate((input ? { input } : null) as I);
      const fields = Object.values(data!);
      if (fields.length !== 1) {
        throw new Error(
          `Expected exactly one field in mutation response, got ${fields.length}`
        );
      }
      return fields[0] as Unwrap<D>;
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
      throw error;
    }
  }) as UseMutationReturn<D, I>;

  const { subscribe } = derived(store, ($store) => ({
    inflight: $store.fetching,
  }));

  mutate.subscribe = subscribe;
  return mutate;
};
