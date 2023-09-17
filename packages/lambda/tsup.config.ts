import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: {
    'adapter': 'src/adapter/index.ts',
    'action': 'src/action/index.ts',
    'cli': 'src/cli/index.ts',
    'adapter-handler': 'src/adapter/handler.ts',
    'http': 'src/http/index.ts',
    'handler': 'src/handler/index.ts',
  },
  format: 'esm',
  dts: true,
});
