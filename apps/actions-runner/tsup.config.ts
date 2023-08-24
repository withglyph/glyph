import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  format: 'esm',
  splitting: false,
  noExternal: [/.*/],
  inject: ['src/shim.ts'],
});
