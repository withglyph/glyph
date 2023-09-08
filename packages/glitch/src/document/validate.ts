import type { DocumentNode } from 'graphql';
import type {
  ValidDocumentNode,
  ValidFragmentDocumentNode,
  ValidOperationDocumentNode,
} from '../types';

export const validateDocumentNode = (
  documentNode: DocumentNode,
): documentNode is ValidDocumentNode => {
  if (documentNode.definitions.length !== 1) {
    console.warn('document must have only one definition');
    return false;
  }

  const definition = documentNode.definitions[0];
  if (
    definition.kind !== 'OperationDefinition' &&
    definition.kind !== 'FragmentDefinition'
  ) {
    console.warn('document must be an operation or fragment');
    return false;
  }

  if (!definition.name) {
    console.warn('document must have a name');
    return false;
  }

  return true;
};

export const validateDocumentNodes = () => {
  // TODO
};

export const isOperationDocumentNode = (
  documentNode: ValidDocumentNode,
): documentNode is ValidOperationDocumentNode => {
  return documentNode.definitions[0].kind === 'OperationDefinition';
};

export const isFragmentDocumentNode = (
  documentNode: ValidDocumentNode,
): documentNode is ValidFragmentDocumentNode => {
  return documentNode.definitions[0].kind === 'FragmentDefinition';
};
