import { derived, writable } from 'svelte/store';
import { getClient } from '../client/internal';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { AnyVariables } from '@urql/core';

export const createMutationStore = (
  document: TypedDocumentNode<unknown, AnyVariables>,
) => {
  const count = writable(0);

  const mutate = async (input?: AnyVariables) => {
    const { client, errorHandler } = await getClient();

    count.update((n) => n + 1);
    const result = await client
      .mutation(document, input ? { input } : undefined)
      .toPromise();
    count.update((n) => n - 1);

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
