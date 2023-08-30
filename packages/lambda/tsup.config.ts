import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    entry: {
      adapter: 'src/adapter/index.ts',
      cli: 'src/cli/index.ts',
      http: 'src/http/index.ts',
    },
    format: 'esm',
    dts: true,
  },
  {
    clean: true,
    entry: { 'adapter-handler': 'src/adapter/handler.ts' },
    format: 'esm',
    splitting: false,
    external: [/^0/],
    noExternal: [/^[^0]/],
    banner: {
      js: `const require = await import('module').then($=>$.createRequire(import.meta.url));`,
    },
  },
]);
