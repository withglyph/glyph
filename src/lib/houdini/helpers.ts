import { derived } from 'svelte/store';
import { AppError } from '$lib/errors';
import { toast } from '$lib/notification';
import type {
  GraphQLObject,
  GraphQLVariables,
  MutationStore,
  QueryResult,
  QueryStore,
} from '$houdini';
import type { Unwrap } from '$lib/types';
import type { Readable } from 'svelte/store';

type Mutate<D extends GraphQLObject> = () => Promise<Unwrap<D>>;

type ParameterizedMutate<
  D extends GraphQLObject,
  I extends GraphQLVariables
> = (input: I) => Promise<Unwrap<D>>;

export const useQuery = <D extends GraphQLObject, I extends GraphQLVariables>(
  store: QueryStore<D, I>
): Readable<D> => {
  return derived(store, ($store: QueryResult<D, I>) => $store.data!);
};

export const useMutation = <
  D extends GraphQLObject,
  V extends GraphQLVariables,
  I extends { input: V } | null,
  O extends GraphQLObject
>(
  store: MutationStore<D, I, O>
): I extends null ? Mutate<D> : ParameterizedMutate<D, V> => {
  return async (input?: V) => {
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
  };
};
