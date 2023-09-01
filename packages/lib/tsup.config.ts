import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    environment: 'src/environment/index.ts',
    unocss: 'src/unocss/index.ts',
    vite: 'src/vite/index.ts',
  },
  format: ['esm'],
  dts: true,
  external: [/^\$/],
});
