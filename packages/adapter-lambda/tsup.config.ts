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
    banner: {
      js: `const require = await import('module').then($=>$.createRequire(import.meta.url));`,
    },
  },
]);
