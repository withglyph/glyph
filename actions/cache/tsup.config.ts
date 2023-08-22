import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,

  entry: ['src/restore.ts', 'src/save.ts'],
  format: 'esm',
});
