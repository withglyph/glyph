import { derived, writable } from 'svelte/store';
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
  input: V,
) => Promise<Unwrap<D>>;
type UseMutationReturn<
  D extends GraphQLObject,
  I extends { input: GraphQLVariables } | null,
> = (I extends { input: infer V } ? ParameterizedMutate<D, V> : Mutate<D>) &
  Readable<{ inflight: boolean }>;
type UseMutationOptions = {
  refetch?: boolean;
  throwOnError?: boolean;
};

// eslint-disable-next-line typescript/no-explicit-any
const renderedQueries: UseQueryReturn<any>[] = [];

export const useQuery = <D extends GraphQLObject, I extends GraphQLVariables>(
  store: QueryStore<D, I>,
): UseQueryReturn<D> => {
  const { subscribe } = derived(store, ($store) => $store.data!);

  const s = {
    subscribe: (run, invalidate) => {
      const unsubscribe = subscribe(run, invalidate);
      renderedQueries.push(s);

      return () => {
        renderedQueries.splice(renderedQueries.indexOf(s), 1);
        unsubscribe();
      };
    },
    refetch: async () => {
      await store.fetch({
        blocking: true,
        policy: 'NetworkOnly',
      });
    },
  } satisfies UseQueryReturn<D>;

  return s;
};

export const useMutation = <
  D extends GraphQLObject,
  V extends GraphQLVariables,
  I extends { input: V } | null,
  O extends GraphQLObject,
>(
  store: MutationStore<D, I, O>,
  options?: UseMutationOptions,
): UseMutationReturn<D, I> => {
  const { subscribe, set } = writable({ inflight: false });
  const mutate = (async (input?: V) => {
    try {
      set({ inflight: true });
      const { data } = await store.mutate((input ? { input } : null) as I);
      const fields = Object.values(data!);
      if (fields.length !== 1) {
        throw new Error(
          `Expected exactly one field in mutation response, got ${fields.length}`,
        );
      }

      if (options?.refetch !== false) {
        await refetchQueries();
      }

      return fields[0] as Unwrap<D>;
    } catch (error) {
      if (options?.throwOnError !== true) {
        if (error instanceof AppError) {
          toast.error(error.message);
        } else {
          console.error(error);
          toast.error('알 수 없는 오류가 발생했어요');
        }
      }

      throw error;
    } finally {
      set({ inflight: false });
    }
  }) as UseMutationReturn<D, I>;

  mutate.subscribe = subscribe;
  return mutate;
};

export const refetchQueries = async () => {
  await Promise.all(
    renderedQueries.map(async (q) =>
      q.refetch().catch(() => {
        // noop
      }),
    ),
  ).catch(() => {
    // noop
  });
};
