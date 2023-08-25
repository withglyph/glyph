import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    entry: ['src/adapter.ts'],
    format: 'esm',
  },
  {
    clean: true,
    entry: ['src/handler.ts'],
    format: 'esm',
    splitting: false,
    external: ['SERVER', 'MANIFEST'],
    noExternal: ['@penxle/lambda', 'mime-types'],
  },
]);
