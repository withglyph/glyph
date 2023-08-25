import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/handlers/finalize.ts', 'src/handlers/transform.ts'],
  format: 'esm',
});
