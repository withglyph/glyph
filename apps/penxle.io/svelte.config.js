import { docker } from '@penxle/adapter-docker';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: docker(),
    alias: { $assets: './src/assets' },
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: 'PRIVATE_',
    },
    typescript: {
      config: (config) => ({
        ...config,
        include: [...config.include, '../pulumi/**/*.ts'],
      }),
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
