import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/entrypoint.ts', 'src/orchestrator.ts'],
  format: 'esm',
  splitting: false,
  noExternal: [/.*/],
  banner: {
    js: 'const require = (await import("module")).createRequire(import.meta.url);',
  },
});
