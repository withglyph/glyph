import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { banner: '/// <reference path="../ambient.d.ts" />' },
  clean: true,
});
