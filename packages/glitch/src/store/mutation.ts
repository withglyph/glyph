import { createRequest } from '@urql/core';
import { derived, writable } from 'svelte/store';
import { filter, fromValue, mergeMap, pipe, take, tap, toPromise } from 'wonka';
import { getClient } from '../client/internal';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { AnyVariables } from '@urql/core';

export const createMutationStore = (document: TypedDocumentNode<unknown, AnyVariables>) => {
  const count = writable(0);

  const mutate = async (input?: AnyVariables) => {
    const { client, transformError, onMutationError } = await getClient();

    const request = createRequest(document, input ? { input } : undefined);
    const operation = client.createRequestOperation('mutation', request, {
      requestPolicy: 'cache-first',
    });

    const result = await pipe(
      fromValue(null),
      tap(() => count.update((n) => n + 1)),
      mergeMap(() => client.executeRequestOperation(operation)),
      filter(({ stale }) => !stale),
      take(1),
      tap(() => count.update((n) => n - 1)),
      toPromise,
    );

    if (result.error?.networkError) {
      const err = transformError(result.error.networkError);
      onMutationError(err);
      throw err;
    }

    if (result.error?.graphQLErrors.length) {
      const err = transformError(result.error.graphQLErrors[0]);
      onMutationError(err);
      throw err;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = result.data!;

    return data[Object.keys(data)[0] as keyof typeof data];
  };

  return Object.assign(
    mutate,
    derived(count, (n) => ({
      inflight: n > 0,
    })),
  );
};
