import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: {
    http: 'src/http/index.ts',
  },
  format: 'esm',
});
