import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
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
    typescript: {
      config: (config) => ({
        ...config,
        compilerOptions: {
          ...config.compilerOptions,
          rootDirs: [...config.compilerOptions.rootDirs, '../$houdini/types'],
        },
        include: [
          'ambient.d.ts',
          './types/**/$types.d.ts',
          '../**/*.ts',
          '../**/*.svelte',
        ],
        exclude: ['../node_modules/**', './[!ambient.d.ts]**'],
      }),
    },
    version: { pollInterval: 60 * 1000 },
  },
};
