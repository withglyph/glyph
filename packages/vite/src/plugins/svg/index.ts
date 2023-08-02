import { readFile } from 'node:fs/promises';
import { optimizeSvg } from '@penxle/lib';
import { compile } from 'svelte/compiler';
import type { Plugin } from 'vite';

export const svg = (): Plugin => ({
  name: 'svg',

  transform: async (_, id, transformOptions) => {
    if (!id.endsWith('.svg?component')) {
      return;
    }

    const filename = id.replace('?component', '');
    const content = await readFile(filename, { encoding: 'utf8' });
    const svg = optimizeSvg(content).replace(/<svg/, '<svg {...$$$$props}');

    const { js } = compile(svg, {
      filename,
      namespace: 'svg',
      css: 'none',
      generate: transformOptions?.ssr ? 'ssr' : 'dom',
      hydratable: !transformOptions?.ssr,
    });

    return js;
  },
});
