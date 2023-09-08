import { createRequest } from '@urql/core';
import { derived, writable } from 'svelte/store';
import { filter, fromValue, mergeMap, pipe, take, tap, toPromise } from 'wonka';
import { getClient } from '../client/internal';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { AnyVariables } from '@urql/core';

export const createMutationStore = (
  document: TypedDocumentNode<unknown, AnyVariables>,
) => {
  const count = writable(0);

  const mutate = async (input?: AnyVariables) => {
    const { client, errorHandler } = await getClient();

    const request = createRequest(document, input ? { input } : undefined);
    const operation = client.createRequestOperation('mutation', request, {
      requestPolicy: 'network-only',
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
      throw result.error.networkError;
    }

    if (result.error?.graphQLErrors.length) {
      throw errorHandler(result.error.graphQLErrors[0]);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = result.data!;

    return data[Object.keys(data)[0] as keyof typeof data];
  };

  return Object.assign(
    mutate,
    derived(count, (n) => n > 0),
  );
};
