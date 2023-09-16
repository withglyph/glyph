import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      adapter: 'src/adapter/index.ts',
      http: 'src/http/index.ts',
      metrics: 'src/metrics/index.ts',
    },
    format: 'esm',
    dts: true,
  },
  {
    entry: {
      'action': 'src/action/index.ts',
      'cli': 'src/cli/index.ts',
      'adapter-handler': 'src/adapter/handler.ts',
    },
    format: 'esm',
  },
]);
