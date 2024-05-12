import { createRequest } from '@urql/core';
import { filter, map, pipe, subscribe as subscribe_, tap } from 'wonka';
import { getClient } from '../client/internal';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { AnyVariables } from '@urql/core';

export const createSubscriptionStore = (document: TypedDocumentNode<unknown, AnyVariables>) => {
  const handlers = new Set<(data: unknown) => void>();

  const subscribe = (variables?: AnyVariables) => {
    const { client, transformError } = getClient();

    const request = createRequest(document, variables);
    const operation = client.createRequestOperation('subscription', request, {
      requestPolicy: 'network-only',
    });

    const { unsubscribe } = pipe(
      client.executeRequestOperation(operation),
      filter(({ stale }) => !stale),
      tap((result) => {
        if (result.error?.networkError) {
          throw transformError('subscription', result.error.networkError);
        }

        if (result.error?.graphQLErrors.length) {
          throw transformError('subscription', result.error.graphQLErrors[0]);
        }
      }),
      map(({ data }) => data),
      subscribe_((data) => {
        for (const handler of handlers) handler(data);
      }),
    );

    return unsubscribe;
  };

  const on = (event: 'data', handler: (data: unknown) => void) => {
    if (event === 'data') handlers.add(handler);
  };

  return { subscribe, on };
};
