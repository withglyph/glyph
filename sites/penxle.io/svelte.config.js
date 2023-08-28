import { lambda } from '@penxle/adapter-lambda';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: lambda(),
    alias: { $assets: './src/assets' },
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: 'PRIVATE_',
    },
    version: { pollInterval: 60 * 1000 },
  },
  onwarn: (warning, handler) => {
    if (warning.code === 'vite-plugin-svelte-css-no-scopable-elements') {
      return;
    }

    handler(warning);
  },
};
