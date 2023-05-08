import { readFile } from 'node:fs/promises'; // eslint-disable-line import/no-nodejs-modules
import { compile } from 'svelte/compiler';
import { optimize } from 'svgo';
import type { Plugin } from 'vite';

export const svg = (): Plugin => ({
  name: 'svg',

  transform: async (_, id, transformOptions) => {
    if (!id.endsWith('.svg?component')) {
      return undefined;
    }

    const filename = id.replace('?component', '');

    const content = await readFile(filename, { encoding: 'utf8' });

    const { data } = optimize(content, {
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: { overrides: { inlineStyles: { onlyMatchedOnce: false } } },
        },
        'convertStyleToAttrs',
      ],
    });

    const svg = data.replace(/<svg/, '<svg {...$$$$props}');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { js } = compile(svg, {
      filename,
      namespace: 'svg',
      css: 'none',
      generate: transformOptions?.ssr ? 'ssr' : 'dom',
      hydratable: !transformOptions?.ssr,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return js;
  },
});
