import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: {
    index: 'src/index.ts',
    environment: 'src/environment/index.ts',
  },
  format: ['esm'],
  dts: true,
  external: [/^\$/],
});
