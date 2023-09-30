import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const configurePlugin = (context: GlitchContext): Plugin => {
  return {
    name: '@penxle/glitch:configure',
    enforce: 'pre',

    configResolved: async (config) => {
      context.root = config.root;
      context.codegenRoot = path.join(config.root, '.glitch');

      await fs.mkdir(context.codegenRoot, { recursive: true });

      config.server.fs.allow.push(context.codegenRoot);
    },
  };
};
