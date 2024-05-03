import path from 'node:path';
import type { Plugin } from 'vite';

export const configurePlugin = (): Plugin => {
  return {
    name: '@withglyph/bifrost:configure',
    enforce: 'pre',

    configResolved: async (config) => {
      const bifrostRoot = path.join(config.root, '.bifrost');
      config.server.fs.allow.push(bifrostRoot);
    },
  };
};
