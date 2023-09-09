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
    console.warn('💥 Document must have only one definition');
    return false;
  }

  const definition = documentNode.definitions[0];
  if (
    definition.kind !== 'OperationDefinition' &&
    definition.kind !== 'FragmentDefinition'
  ) {
    console.warn('💥 Document must be an operation or fragment');
    return false;
  }

  if (!definition.name) {
    console.warn('💥 Document must have a name');
    return false;
  }

  return true;
};

export const validateDocumentNodes = (documentsNodes: ValidDocumentNode[]) => {
  const names = documentsNodes.map(
    (documentNode) => documentNode.definitions[0].name.value,
  );

  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index,
  );

  if (duplicates.length > 0) {
    console.warn('💥 Documents must have unique names');
    console.warn(`💥 Duplicates: ${duplicates.join(', ')}`);
    return false;
  }

  return true;
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
