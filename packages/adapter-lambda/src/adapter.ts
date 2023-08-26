import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Adapter } from '@sveltejs/kit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const lambda = (): Adapter => {
  return {
    name: '@penxle/adapter-lambda',
    adapt: async (builder) => {
      const out = builder.getBuildDirectory('lambda');

      builder.rimraf(out);
      builder.mkdirp(out);

      builder.writeServer(out);
      builder.copy(
        path.join(__dirname, 'handler.js'),
        path.join(out, 'handler.js'),
        {
          replace: {
            SERVER: './index.js',
            MANIFEST: './manifest.js',
          },
        },
      );

      await fs.appendFile(
        path.join(out, 'manifest.js'),
        `\n\nexport const prerendered = new Set(${JSON.stringify(
          builder.prerendered.paths,
        )});\n`,
      );

      builder.writeClient(path.join(out, '_assets'));
      builder.writePrerendered(path.join(out, '_assets'));
    },
  };
};
