import { createRequest } from '@urql/core';
import { readable } from 'svelte/store';
import { filter, map, pipe, subscribe, take, toPromise } from 'wonka';
import { getClient } from '../client/internal';
import type { LoadEvent } from '@sveltejs/kit';
import type { AnyVariables, TypedDocumentNode } from '@urql/core';

export const createQueryStore = async (
  event: LoadEvent,
  document: TypedDocumentNode<unknown, AnyVariables>,
  variablesLoader?: (event: LoadEvent) => AnyVariables,
) => {
  const { client, errorHandler } = await getClient();

  const variables = variablesLoader ? variablesLoader(event) : undefined;
  const request = createRequest(document, variables);

  const response = await pipe(
    client.executeQuery(request, {
      fetch: event.fetch,
      requestPolicy: 'network-only',
    }),
    filter(({ stale }) => !stale),
    take(1),
    toPromise,
  );

  if (response.error?.networkError) {
    throw response.error.networkError;
  }

  if (response.error?.graphQLErrors.length) {
    throw errorHandler(response.error.graphQLErrors[0]);
  }

  return readable(response.data, (set) => {
    const { unsubscribe } = pipe(
      client.executeQuery(request, {
        requestPolicy: 'cache-first',
      }),
      map(({ data }) => data),
      subscribe(set),
    );

    return unsubscribe;
  });
};
