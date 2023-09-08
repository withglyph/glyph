import { codegen } from '../codegen';
import { refreshDocuments } from '../document';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const codegenPlugin = (context: GlitchContext): Plugin => {
  return {
    name: '@penxle/glitch:codegen',
    enforce: 'pre',

    buildStart: async () => {
      const refreshed = await refreshDocuments(context);
      if (refreshed) {
        await codegen(context);
      }
    },

    configureServer: async (server) => {
      server.watcher.on('all', async () => {
        const refreshed = await refreshDocuments(context);
        if (refreshed) {
          await codegen(context);
        }
      });
    },
  };
};
