import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
// eslint-disable-next-line import/no-default-export
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: vercel({
      runtime: 'nodejs18.x',
      regions: ['icn1'],
    }),
    alias: {
      $assets: './src/assets',
      $houdini: './$houdini',
    },
    files: {
      hooks: {
        server: 'src/hooks/server',
        client: 'src/hooks/client',
      },
    },
    version: { pollInterval: 60 * 1000 },
  },
};
