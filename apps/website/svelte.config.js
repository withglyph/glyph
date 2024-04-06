import { docker } from '@withglyph/adapter-docker';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: preprocess(),
  kit: {
    adapter: docker(),
    alias: {
      '$assets': './src/assets',
      '$bifrost': './.bifrost',
      '$styled-system': './styled-system/*',
    },
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: 'PRIVATE_',
    },
    files: {
      hooks: {
        server: 'src/hooks/server',
        client: 'src/hooks/client',
      },
    },
    paths: {
      relative: false,
    },
    typescript: {
      config: (config) => ({
        ...config,
        include: [...config.include, '../pulumi/**/*.ts', '../scripts/**/*.ts'],
      }),
    },
    version: { pollInterval: 60 * 1000 },
  },
};
