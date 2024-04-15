import { docker } from '@withglyph/adapter-docker';
import { mdsvex } from 'mdsvex';
import gfm from 'remark-gfm';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.md'],
  preprocess: [
    preprocess(),
    mdsvex({
      extensions: ['.md'],
      remarkPlugins: [gfm],
      smartypants: false,
    }),
  ],
  kit: {
    adapter: docker(),
    alias: {
      '$assets': './src/assets',
      '$pages': './src/pages',
      '$styled-system': './styled-system/*',
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
};
