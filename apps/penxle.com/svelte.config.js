import { lambda } from '@penxle/lambda/adapter';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: lambda(),
    alias: {
      $assets: './src/assets',
      $houdini: './$houdini',
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
    typescript: {
      config: (config) => ({
        ...config,
        compilerOptions: {
          ...config.compilerOptions,
          rootDirs: [...config.compilerOptions.rootDirs, '../$houdini/types'],
        },
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
