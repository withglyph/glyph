import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/restore.ts', 'src/save.ts'],
  format: 'esm',
  minify: true,
  splitting: false,
  noExternal: [/.*/],
  banner: {
    js: `const require = await import('module').then($=>$.createRequire(import.meta.url));`,
  },
});
