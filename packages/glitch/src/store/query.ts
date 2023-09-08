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
  const operation = client.createRequestOperation('query', request, {
    fetch: event.fetch,
    requestPolicy: 'network-only',
  });

  const source = client.executeRequestOperation(operation);
  const result = await pipe(
    source,
    filter(({ stale }) => !stale),
    take(1),
    toPromise,
  );

  if (result.error?.networkError) {
    throw result.error.networkError;
  }

  if (result.error?.graphQLErrors.length) {
    throw errorHandler(result.error.graphQLErrors[0]);
  }

  const store = readable(result.data, (set) => {
    const operation = client.createRequestOperation('query', request, {
      fetch: event.fetch,
      requestPolicy: 'cache-first',
    });

    const source = client.executeRequestOperation(operation);
    const { unsubscribe } = pipe(
      source,
      map(({ data }) => data),
      subscribe(set),
    );

    return unsubscribe;
  });

  const obj = {
    refetch: () => {
      client.reexecuteOperation(operation);
    },
  };

  return Object.assign(store, obj);
};
