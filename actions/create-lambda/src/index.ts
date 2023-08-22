// import github from '@actions/github';
import path from 'node:path';
import actions from '@actions/core';
import { nodeFileTrace } from '@vercel/nft';
import esbuild from 'esbuild';

// import glob from 'fast-glob';
// import Zip from 'jszip';

const tmp = process.env.RUNNER_TEMP
  ? path.join(process.env.RUNNER_TEMP, 'lambda')
  : '/tmp/lambda';

await esbuild.build({
  entryPoints: { index: actions.getInput('entrypoint') },
  outdir: path.join(tmp, 'esbuild'),

  format: 'esm',
  target: 'esnext',
  platform: 'node',

  bundle: true,
  splitting: true,
  packages: 'external',

  assetNames: 'assets/[name]-[hash]',
  chunkNames: 'chunks/[name]-[hash]',
  entryNames: '[name]',
});

// builder.log.minor('Optimizing dependencies...');

const traced = await nodeFileTrace([path.join(tmp, 'esbuild/index.js')], {
  base: '.',
});

// const files = [...traced.fileList];

// let root = files[0];
// for (let i = 1; i < files.length; i++) {
//   while (!files[i].startsWith(root)) {
//     root = root.slice(0, Math.max(0, root.length - 1));
//   }
// }

for (const { message } of traced.warnings) {
  if (message.startsWith('Failed to resolve dependency')) {
    const m = /Cannot find module '(.+?)' loaded from (.+)/.exec(message);
    const [, module, importer] = m ?? [null, message, '(unknown)'];

    if (importer.includes('node_modules')) {
      continue;
    }

    actions.error(`Missing dependency: ${module} (imported by ${importer})`);
  }
}

// for (const src of files) {
//   const dst = path.join(tmp, 'function', path.relative(root, src));

//   await fs.mkdir(path.dirname(dst), { recursive: true });

//   const stat = await fs.lstat(src);
//   if (stat.isDirectory()) {
//     await fs.mkdir(dst);
//   } else if (stat.isFile()) {
//     await fs.copyFile(src, dst);
//   } else if (stat.isSymbolicLink()) {
//     const link = await fs.readlink(src);
//     await fs.symlink(link, dst);
//   }
// }

actions.info('Creating function bundle...');

// builder.copy(
//   path.join(__dirname, 'entrypoint.js'),
//   path.join(tmp, 'function/index.mjs'),
//   {
//     replace: {
//       HANDLER: `./${path.join(path.relative(root, tmp), 'build/handler.js')}`,
//     },
//   },
// );

// builder.writeClient(path.join(tmp, 'function/assets'));
// builder.writePrerendered(path.join(tmp, 'function/prerendered'));

// const zip = new Zip();
// const entries = await glob('**/*', {
//   cwd: path.join(tmp, 'function'),
//   dot: true,
//   objectMode: true,
//   stats: true,
//   onlyFiles: false,
//   followSymbolicLinks: false,
// });

// for (const entry of entries.sort()) {
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   const stat = entry.stats!;
//   const p = path.join(tmp, 'function', entry.path);

//   if (stat.isSymbolicLink()) {
//     const link = await fs.readlink(p);
//     zip.file(entry.path, link, {
//       date: new Date('1970-01-01T00:00:00Z'),
//       createFolders: false,
//       unixPermissions: 0o12_0755,
//     });
//   } else if (stat.isFile()) {
//     const body = await fs.readFile(p);
//     zip.file(entry.path, body, {
//       date: new Date('1970-01-01T00:00:00Z'),
//       createFolders: false,
//       unixPermissions: 0o755,
//     });
//   }
// }

// const buffer = await zip.generateAsync({
//   compression: 'DEFLATE',
//   compressionOptions: { level: 9 },
//   type: 'nodebuffer',
//   platform: 'UNIX',
// });

// const hash = crypto.createHash('sha256').update(buffer).digest('base64');

// builder.log.minor('Writing final assets...');

// await fs.mkdir(path.join(out, 'functions'));
// await fs.writeFile(path.join(out, 'function.zip'), buffer);
// await fs.writeFile(path.join(out, 'function.hash'), hash);

// builder.log.minor('Cleaning up...');

// builder.rimraf(path.join(tmp, 'intermidiate'));
// builder.rimraf(path.join(tmp, 'build'));
