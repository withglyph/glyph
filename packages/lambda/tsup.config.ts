import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    entry: {
      adapter: 'src/adapter/index.ts',
      http: 'src/http/index.ts',
      metrics: 'src/metrics/index.ts',
    },
    format: 'esm',
    dts: true,
  },
  {
    clean: true,
    entry: {
      'action': 'src/action/index.ts',
      'cli': 'src/cli/index.ts',
      'adapter-handler': 'src/adapter/handler.ts',
    },
    format: 'esm',
  },
]);
