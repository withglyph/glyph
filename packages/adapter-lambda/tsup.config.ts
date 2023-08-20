import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,

  entry: ['src/index.ts', 'src/handler.ts'],
  format: 'esm',

  external: ['0SERVER', '0MANIFEST'],
});
