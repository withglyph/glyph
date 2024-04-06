import * as R from 'radash';
import { writeArtifactAssets, writeMiscAssets, writePublicAssets } from '../codegen/writer';
import { buildContext } from '../context';
import type { Plugin } from 'vite';
import type { ContextHolder } from '../types';

export const codegenPlugin = (contextHolder: ContextHolder): Plugin => {
  const buildAndWriteContext = async () => {
    try {
      const context = await buildContext();
      await writeArtifactAssets(context.bifrostDir, context.schema, context.operationMap, context.fragmentMap);
      await writePublicAssets(context.bifrostDir, context.artifacts);
      await writeMiscAssets(context.bifrostDir);
      contextHolder.context = context;
    } catch (err: unknown) {
      console.error('🌈', err);
    }
  };

  const debounced = R.debounce({ delay: 100 }, buildAndWriteContext);

  return {
    name: '@withglyph/bifrost:codegen',
    enforce: 'pre',

    buildStart: async () => {
      await buildAndWriteContext();
    },

    configureServer: async () => {
      await buildAndWriteContext();
    },

    watchChange: (id) => {
      if (id.includes('/src/')) {
        debounced();
      }
    },
  };
};
