import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  target: 'node18',
  format: 'cjs',
  noExternal: [/.*/],
  banner: { js: `const crypto = require('crypto');` },
});
