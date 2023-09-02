import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/handlers/*.ts'],
  format: 'esm',
});
