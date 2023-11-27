import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/index.ts', 'src/server.ts'],
  format: 'esm',
  dts: true,
});
