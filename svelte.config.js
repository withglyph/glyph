import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
// eslint-disable-next-line import/no-default-export
export default {
  preprocess: preprocess(),
  kit: {
    adapter: vercel({ runtime: 'nodejs18.x', regions: ['icn1'] }),
    alias: {
      $assets: './src/assets',
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
