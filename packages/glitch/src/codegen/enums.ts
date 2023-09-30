import { codegen } from '@graphql-codegen/core';
import * as typescript from '@graphql-codegen/typescript';
import { disableFragmentWarnings } from 'graphql-tag';
import type { GlitchContext } from '../types';

disableFragmentWarnings();

export const generateEnumTypes = async (context: GlitchContext) => {
  if (!context.schema) {
    return '';
  }

  return await codegen({
    filename: 'enums.d.ts',
    schema: context.schema,
    documents: context.artifacts.map(({ documentNode }) => ({ document: documentNode })),
    pluginMap: { typescript },
    plugins: [{ typescript: {} }],
    config: {
      enumsAsTypes: true,
      namingConvention: { enumValues: 'keep' },
      onlyEnums: true,
    },
  });
};
