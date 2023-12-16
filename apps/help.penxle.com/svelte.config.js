import { docker } from '@penxle/adapter-docker';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import gfm from 'remark-gfm';

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      remarkPlugins: [gfm],
      smartypants: false,
    }),
  ],
  kit: {
    adapter: docker(),
    alias: {
      $assets: './src/assets',
      $pages: './src/pages',
    },
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
