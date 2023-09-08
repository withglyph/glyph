import { createFragmentStore } from '../store/fragment';
import { createMutationStore } from '../store/mutation';
import type { AnyVariables, TypedDocumentNode } from '@urql/core';

export const graphql = (
  kind: 'query' | 'mutation' | 'subscription' | 'fragment',
  document?: TypedDocumentNode<unknown, AnyVariables>,
) => {
  if (kind === 'query') {
    throw new Error('query is not supported in the runtime');
  } else if (kind === 'mutation' && document) {
    return createMutationStore(document);
  } else if (kind === 'fragment') {
    return null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fragment = (ref: unknown, _document: never) => {
  return createFragmentStore(ref);
};

export { createQueryStore } from '../store/query';
export type * from '../types';
export type { TypedDocumentNode } from '@graphql-typed-document-node/core';
