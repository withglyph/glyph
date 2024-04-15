import path from 'node:path';
import * as R from 'radash';
import { codegen } from '../codegen';
import { collectDocuments } from '../document';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const codegenPlugin = (context: GlitchContext): Plugin => {
  return {
    name: '@withglyph/glitch:codegen',
    enforce: 'pre',

    buildStart: async () => {
      const { refreshed } = await collectDocuments(context);
      if (refreshed) {
        await codegen(context);
      }
    },

    configureServer: async (server) => {
      const collect = R.debounce({ delay: 500 }, async () => {
        const { refreshed } = await collectDocuments(context);
        if (refreshed) {
          await codegen(context);
        }
      });

      server.watcher.on('all', async (eventName, eventPath) => {
        if (eventName !== 'add' && eventName !== 'change' && eventName !== 'unlink') {
          return;
        }

        if (!eventPath.startsWith(path.join(context.root, 'src'))) {
          return;
        }

        collect();
      });
    },
  };
};
