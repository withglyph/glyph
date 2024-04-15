import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const configurePlugin = (context: GlitchContext): Plugin => {
  return {
    name: '@withglyph/glitch:configure',
    enforce: 'pre',

    configResolved: async (config) => {
      context.root = config.root;
      context.codegenRoot = path.join(config.root, '.glitch');

      await fs.mkdir(context.codegenRoot, { recursive: true });

      config.server.fs.allow.push(context.codegenRoot);

      try {
        const state = await fs.readFile(path.join(context.codegenRoot, 'state.json'), 'utf8');
        context.state = JSON.parse(state);
      } catch {
        // noop
      }
    },
  };
};
