import { createFragmentStore } from '../store/fragment';
import { createMutationStore } from '../store/mutation';
import { createSubscriptionStore } from '../store/subscription';
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
  } else if (kind === 'subscription' && document) {
    return createSubscriptionStore(document);
  }
};

export const fragment = (ref: unknown) => {
  return createFragmentStore(ref);
};

export { createManualQueryStore, createQueryStore } from '../store/query';
export type { FragmentType, MakeRequired } from '../types';
export type { TypedDocumentNode } from '@graphql-typed-document-node/core';
