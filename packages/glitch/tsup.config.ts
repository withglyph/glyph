import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli/index.ts',
    index: 'src/index.ts',
    runtime: 'src/runtime/index.ts',
    vite: 'src/vite/index.ts',
  },
  format: ['esm'],
  external: [/^\$/],
  dts: true,
});
