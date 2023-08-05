import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,

  entry: ['src/index.ts'],
  format: ['esm'],

  dts: {
    banner: '/// <reference path="../ambient.d.ts" />',
  },

  external: ['svgo'],
  noExternal: ['@penxle/lib'],
});
