import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/serve.ts', 'src/shrink.ts'],
  format: 'esm',
});
