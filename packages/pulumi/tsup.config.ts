import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: {
    index: 'src/index.ts',
    components: 'src/components/index.ts',
  },
  format: 'esm',
  dts: true,
});
