import { docker } from '@withglyph/adapter-docker';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: preprocess(),
  kit: {
    adapter: docker(),
    alias: {
      '$assets': './src/assets',
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
