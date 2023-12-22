import fs from 'node:fs/promises';
import { bundle } from '@penxle/lib/deps';
import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  format: 'esm',
  onSuccess: async () => {
    await bundle({
      entry: 'dist/index.js',
      outDir: 'out',
      index: (entry) => `import '${entry}';`,
    });

    await fs.rm('dist', { recursive: true, force: true });
    await fs.rename('out', 'dist');
  },
});
