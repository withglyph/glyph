import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { ignoreMissingModules } from './plugin';
import type { Adapter } from '@sveltejs/kit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const banner =
  'var require=(await import("node:module")).createRequire(import.meta.url),__filename=(await import("node:url")).fileURLToPath(import.meta.url),__dirname=(await import("node:path")).dirname(__filename);';

export const lambda = (): Adapter => {
  return {
    name: '@penxle/adapter-lambda',
    adapt: async (builder) => {
      const out = 'dist';
      const tmp = builder.getBuildDirectory('adapter-lambda');

      builder.rimraf(out);
      builder.rimraf(tmp);
      builder.mkdirp(tmp);

      builder.log.minor('Copying assets...');
      builder.writeClient(`${out}/static`);
      builder.writePrerendered(`${out}/static`);

      builder.log.minor('Building server...');
      builder.writeServer(tmp);

      builder.copy(`${__dirname}/handler.js`, `${tmp}/handler.js`, {
        replace: {
          '0SERVER': './index.js',
          '0MANIFEST': './manifest.js',
        },
      });

      await writeFile(
        `${tmp}/manifest.js`,
        `export const manifest = ${builder.generateManifest({
          relativePath: './',
        })};`,
      );

      await esbuild.build({
        entryPoints: [`${tmp}/handler.js`],
        outdir: `${out}/server`,

        format: 'esm',
        target: 'esnext',
        platform: 'node',

        bundle: true,
        // minify: true,
        splitting: true,

        assetNames: 'assets/[hash]',
        chunkNames: 'chunks/[hash]',
        entryNames: '[name]',

        loader: { '.node': 'binary', '.html': 'text' },
        plugins: [ignoreMissingModules(builder)],

        banner: { js: banner },
      });
    },
  };
};
