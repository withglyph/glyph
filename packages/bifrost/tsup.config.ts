import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    client: 'src/client/index.ts',
    runtime: 'src/runtime/index.ts',
    vite: 'src/vite/index.ts',
  },
  format: ['esm'],
  external: [/^\$/],
  dts: true,
});
