import { createRequest } from '@urql/core';
import { readable } from 'svelte/store';
import { filter, makeSubject, map, pipe, share, subscribe, switchAll, switchMap, take, toPromise } from 'wonka';
import { getClient } from '../client/internal';
import type { LoadEvent } from '@sveltejs/kit';
import type { AnyVariables, GraphQLRequest, OperationResult, TypedDocumentNode } from '@urql/core';
import type { Source } from 'wonka';

export const createQueryStore = async (
  event: LoadEvent,
  document: TypedDocumentNode<unknown, AnyVariables>,
  variablesLoader?: (event: LoadEvent) => AnyVariables,
) => {
  const { client, transformError } = await getClient();

  const variables = variablesLoader ? variablesLoader(event) : undefined;
  const request = createRequest(document, variables);
  const operation = client.createRequestOperation('query', request, {
    fetch: event.fetch,
    meta: { source: 'load' },
    requestPolicy: 'network-only',
  });

  const result = await pipe(
    client.executeRequestOperation(operation),
    filter(({ stale }) => !stale),
    take(1),
    toPromise,
  );

  if (result.error?.networkError) {
    throw result.error.networkError;
  }

  if (result.error?.graphQLErrors.length) {
    throw transformError(result.error.graphQLErrors[0]);
  }

  const { source, next } = makeSubject<GraphQLRequest>();

  const store = readable(result.data, (set) => {
    const { unsubscribe } = pipe(
      source,
      switchMap((request) => {
        const operation = client.createRequestOperation('query', request, {
          meta: { source: 'store' },
          requestPolicy: 'cache-only',
        });

        return client.executeRequestOperation(operation);
      }),
      map(({ data }) => data),
      subscribe(set),
    );

    next(request);

    return unsubscribe;
  });

  const obj = {
    refetch: async (newVariables?: AnyVariables) => {
      const request = createRequest(document, newVariables ?? variables);
      const operation = client.createRequestOperation('query', request, {
        meta: { source: 'store' },
        requestPolicy: 'network-only',
      });

      const result = await pipe(
        client.executeRequestOperation(operation),
        filter(({ stale }) => !stale),
        take(1),
        toPromise,
      );

      if (result.error?.networkError) {
        throw result.error.networkError;
      }

      if (result.error?.graphQLErrors.length) {
        throw transformError(result.error.graphQLErrors[0]);
      }

      next(request);

      return result.data;
    },
  };

  return Object.assign(store, obj);
};

export const createManualQueryStore = (document: TypedDocumentNode<unknown, AnyVariables>) => {
  const { source, next } = makeSubject<Source<OperationResult>>();

  const store = readable<unknown>(undefined, (set) => {
    const { unsubscribe } = pipe(
      source,
      switchAll,
      map(({ data }) => data),
      subscribe(set),
    );

    return unsubscribe;
  });

  const obj = {
    refetch: async (variables?: AnyVariables) => {
      const { client, transformError } = await getClient();

      const request = createRequest(document, variables);
      const operation = client.createRequestOperation('query', request, {
        meta: { source: 'store' },
        requestPolicy: 'network-only',
      });

      const source = pipe(client.executeRequestOperation(operation), share);

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
        throw transformError(result.error.graphQLErrors[0]);
      }

      next(source);

      return result.data;
    },
  };

  return Object.assign(store, obj);
};
