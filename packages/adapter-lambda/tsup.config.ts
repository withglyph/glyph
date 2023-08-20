import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,

  entry: ['src/index.ts', 'src/handler.ts', 'src/entrypoint.ts'],
  format: 'esm',
  splitting: false,

  external: ['SERVER', 'MANIFEST', 'HANDLER'],
});
