import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: vercel({ runtime: 'edge' }),
    alias: { $assets: './src/assets' },
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: 'PRIVATE_',
    },
    typescript: {
      config: (config) => ({
        ...config,
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
