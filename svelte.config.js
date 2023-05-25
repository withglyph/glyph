import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: preprocess(),
  kit: {
    adapter: vercel({ runtime: 'edge', regions: ['icn1'] }),
    alias: {
      $assets: './src/assets',
      $houdini: './$houdini',
      $kysely: './$kysely',
    },
    files: {
      hooks: { server: 'src/hooks/server', client: 'src/hooks/client' },
    },
    // inlineStyleThreshold: 10 * 1024,
    output: { preloadStrategy: 'preload-mjs' },
    version: { pollInterval: 60 * 1000 },
  },
  onwarn: (warning, handler) => {
    if (warning.code.startsWith('a11y-')) {
      return;
    }
    handler(warning);
  },
};
