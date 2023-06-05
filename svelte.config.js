import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
// eslint-disable-next-line import/no-default-export
export default {
  preprocess: preprocess(),
  kit: {
    adapter: vercel({
      runtime: 'edge',
      regions: ['icn1'],
    }),
    alias: {
      $assets: './src/assets',
      $houdini: './$houdini',
      $kysely: './$kysely',
    },
    files: {
      hooks: {
        server: 'src/hooks/server',
        client: 'src/hooks/client',
      },
    },
    output: {
      preloadStrategy: 'preload-mjs',
    },
    version: {
      pollInterval: 60 * 1000,
    },
  },
};
