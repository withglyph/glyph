import { codegenPlugin } from './codegen';
import { configurePlugin } from './configure';
import { transformGraphQLPlugin } from './transform-graphql';
import { transformLoadPlugin } from './transform-load';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const glitch = (): Plugin[] => {
  const context: GlitchContext = {
    root: '',
    codegenRoot: '',

    schema: undefined,
    artifacts: [],

    state: {
      schemaHash: 0,
      artifactHashes: [],
    },
  };

  return [
    configurePlugin(context),
    codegenPlugin(context),
    transformLoadPlugin(context),
    transformGraphQLPlugin(context),
  ];
};
