import fs from 'node:fs/promises';
import path from 'node:path';
import { lambdify } from '../cli';
import type { Adapter } from '@sveltejs/kit';

export const lambda = (): Adapter => {
  return {
    name: '@penxle/lambda',
    adapt: async (builder) => {
      const out = builder.getBuildDirectory('lambda');

      builder.rimraf(out);
      builder.mkdirp(out);

      builder.writeServer(out);

      await fs.appendFile(
        path.join(out, 'manifest.js'),
        `
          export const prerendered = new Set(${JSON.stringify(
            builder.prerendered.paths,
          )});
        `,
      );

      await fs.writeFile(
        path.join(out, 'handler.js'),
        `
          import '@penxle/tracing';
          import path from 'node:path';
          import { fileURLToPath } from 'node:url';
          import { createHandler } from '@penxle/lambda/adapter/handler';
          import { Server } from './index.js';
          import { manifest, prerendered } from './manifest.js';
          const basePath = path.dirname(fileURLToPath(import.meta.url));
          export const handler = await createHandler({ basePath, Server, manifest, prerendered });
        `,
      );

      builder.writeClient(path.join(out, 'public'));
      builder.writePrerendered(path.join(out, 'public'));

      await lambdify({
        entry: ['.svelte-kit/lambda/handler.js'],
        public: '.svelte-kit/lambda/public',
      });
    },
  };
};
