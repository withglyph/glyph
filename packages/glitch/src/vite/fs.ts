import fsSync from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const fsPlugin = (context: GlitchContext): Plugin => {
  const shouldDetour = () => {
    const err = new Error('stack');
    return err.stack?.includes('create_routes_and_nodes') || err.stack?.includes('write_all_types');
  };

  const shouldFake = (p: string) => {
    if (!shouldDetour()) {
      return false;
    }

    const filePath = path.resolve(context.root, p);
    return context.state.fakePaths.includes(filePath);
  };

  return {
    name: '@penxle/glitch:fs',
    enforce: 'pre',

    configResolved: () => {
      const { readdirSync, readFileSync, statSync } = fsSync;

      // @ts-expect-error monkey patch
      fsSync.readdirSync = (p: string, ...args) => {
        // @ts-expect-error monkey patch
        const files = readdirSync(p, ...args);

        if (!shouldDetour()) {
          return files;
        }

        for (const file of files) {
          const m = /^\+(page|layout).*\.svelte$/.exec(file);
          if (m) {
            const fileName = `+${m[1]}.ts`;
            const filePath = path.join(p, fileName);
            if (files.includes(fileName)) {
              context.state.fakePaths = context.state.fakePaths.filter((fakePath) => fakePath !== filePath);
            } else {
              files.push(fileName);
              context.state.fakePaths.push(filePath);
            }
          }
        }

        return files;
      };

      // @ts-expect-error monkey patch
      fsSync.readFileSync = (p: string, ...args) => {
        if (shouldFake(p)) {
          return '';
        }

        return readFileSync(p, ...args);
      };

      // @ts-expect-error monkey patch
      fsSync.statSync = (p: string, ...args) => {
        if (shouldFake(p)) {
          return {
            isFile: () => true,
            isDirectory: () => false,
          };
        }

        return statSync(p, ...args);
      };
    },

    resolveId: (id, importer) => {
      const filePath = path.join(importer ? path.dirname(importer) : context.root, id);

      if (context.state.fakePaths.includes(filePath)) {
        return filePath;
      }
    },

    load: (id) => {
      if (context.state.fakePaths.includes(id)) {
        return '';
      }
    },
  };
};
