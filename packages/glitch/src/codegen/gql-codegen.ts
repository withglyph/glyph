import { codegen } from '@graphql-codegen/core';
import * as typedDocumentNode from '@graphql-codegen/typed-document-node';
import * as typescript from '@graphql-codegen/typescript';
import * as typescriptOperations from '@graphql-codegen/typescript-operations';
import { disableFragmentWarnings } from 'graphql-tag';
import type { GlitchContext } from '../types';

disableFragmentWarnings();

export const generateGQLCodegen = async (context: GlitchContext) => {
  if (!context.schema) {
    return '';
  }

  return await codegen({
    filename: 'gql.ts',
    schema: context.schema,
    documents: context.artifacts.map(({ documentNode }) => ({
      document: documentNode,
    })),
    pluginMap: { typescript, typescriptOperations, typedDocumentNode },
    plugins: [
      { typescript: {} },
      {
        typescriptOperations: {
          inlineFragmentTypes: 'mask',
          namingConvention: 'keep',
          omitOperationSuffix: true,
          skipTypename: true,
        },
      },
      {
        typedDocumentNode: {
          documentNodeImport: '@penxle/glitch/runtime#TypedDocumentNode',
          documentVariablePrefix: 'DocumentNode_',
          documentVariableSuffix: '',
          fragmentVariablePrefix: 'DocumentNode_',
          fragmentVariableSuffix: '',
          namingConvention: 'keep',
          omitOperationSuffix: true,
          useTypeImports: true,
        },
      },
    ],
    config: {},
  });
};
