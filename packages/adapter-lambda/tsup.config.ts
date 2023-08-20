import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    entry: ['src/index.ts'],
    format: 'esm',
  },
  {
    clean: true,
    entry: ['src/handler.ts', 'src/entrypoint.ts'],
    format: 'esm',
    splitting: false,
    minify: true,
    external: ['SERVER', 'MANIFEST', 'HANDLER'],
    noExternal: ['mime-types', 'itty-router'],
    banner: {
      js: `var require=(await import("node:module")).createRequire(import.meta.url);`,
    },
  },
]);
