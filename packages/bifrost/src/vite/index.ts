import { codegenPlugin } from './codegen';
import { configurePlugin } from './configure';
import { transformGraphQLPlugin } from './transform-graphql';
import { transformLoadPlugin } from './transform-load';
import type { Plugin } from 'vite';
import type { ContextHolder } from '../types';

export const bifrost = (): Plugin[] => {
  const contextHolder: ContextHolder = {
    context: null,
  };

  return [
    configurePlugin(),
    codegenPlugin(contextHolder),
    transformLoadPlugin(contextHolder),
    transformGraphQLPlugin(contextHolder),
  ];
};
