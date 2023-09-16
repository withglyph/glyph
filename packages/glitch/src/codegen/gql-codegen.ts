import { codegen } from '@graphql-codegen/core';
import * as typedDocumentNode from '@graphql-codegen/typed-document-node';
import * as typescript from '@graphql-codegen/typescript';
import * as typescriptOperations from '@graphql-codegen/typescript-operations';
import * as urqlGraphcache from '@graphql-codegen/typescript-urql-graphcache';
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
    pluginMap: {
      typescript,
      typescriptOperations,
      typedDocumentNode,
      urqlGraphcache,
    },
    plugins: [
      { typescript: {} },
      { typescriptOperations: { skipTypename: true } },
      { typedDocumentNode: {} },
      { urqlGraphcache: {} },
    ],
    config: {
      avoidOptionals: true,
      documentNodeImport: '@penxle/glitch/runtime#TypedDocumentNode',
      documentVariablePrefix: 'DocumentNode_',
      documentVariableSuffix: '',
      enumsAsTypes: true,
      fragmentVariablePrefix: 'DocumentNode_',
      fragmentVariableSuffix: '',
      inlineFragmentTypes: 'mask',
      namingConvention: {
        typeNames: 'change-case-all#upperCaseFirst',
        enumValues: 'keep',
        transformUnderscore: true,
      },
      omitOperationSuffix: true,
      useTypeImports: true,
    },
  });
};
