import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { nodeFileTrace } from '@vercel/nft';
import fg from 'fast-glob';
import * as fflate from 'fflate';
import { getLambdaSpec, getWorkspaceDir } from './utils';
import type { LambdaSpec } from './utils';

export const lambdify = async (spec?: LambdaSpec) => {
  const workspaceDir = await getWorkspaceDir();
  const projectDir = process.cwd();

  const outDir = path.join(projectDir, '.lambda');
  const tmpDir = path.join(outDir, 'tmp');
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(tmpDir, { recursive: true });

  if (!spec) {
    spec = await getLambdaSpec(projectDir);
  }

  console.info(`Building project as a lambda function...`);
  console.log();

  console.info('Project directory: ' + projectDir);
  console.info('Entrypoint path: ' + spec.entry.join(', '));
  console.info('Public path: ' + (spec.public ?? '(none)'));
  console.log();

  console.debug('Analyzing dependencies...');

  const traces = [];

  for (const entry of spec.entry) {
    const trace = await nodeFileTrace([path.join(projectDir, entry)], {
      base: workspaceDir,
    });

    traces.push(...trace.fileList);
  }

  // for (const { message } of traced.warnings) {
  //   if (message.startsWith('Failed to resolve dependency')) {
  //     const m = /Cannot find module '(.+?)' loaded from (.+)/.exec(message);
  //     let [, mod, importer] = m ?? [null, message, '(unknown)'];

  //     if (mod.startsWith('/')) {
  //       mod = path.relative(workspaceDir, mod);
  //     }

  //     if (importer.startsWith('/')) {
  //       importer = path.relative(workspaceDir, importer);
  //     }

  //     const diag = `Missing dependency: ${mod} (imported by ${importer})`;
  //     if (importer.includes('node_modules')) {
  //       console.warn(diag);
  //     } else {
  //       console.error(diag);
  //     }
  //   }
  // }

  const files = [...new Set(traces)].map((p) => path.join(workspaceDir, p));

  if (spec.public) {
    const publicPaths = await fg(
      path.join(path.join(projectDir, spec.public), '**/*'),
    );

    files.push(...publicPaths);
  }

  console.debug('Copying files...');

  for (const src of files) {
    const stat = await fs.lstat(src);
    const dst = path.join(tmpDir, path.relative(workspaceDir, src));
    await fs.mkdir(path.dirname(dst), { recursive: true });

    if (stat.isSymbolicLink()) {
      const link = await fs.readlink(src);
      await fs.symlink(link, dst);
    } else if (stat.isFile()) {
      await fs.copyFile(src, dst);
    }
  }

  console.debug('Writing handlers...');

  for (const entry of spec.entry) {
    const code = `
      export * from './${path.relative(
        workspaceDir,
        path.join(projectDir, entry),
      )}';
    `.trim();
    await fs.writeFile(path.join(tmpDir, path.basename(entry)), code);
  }

  await fs.writeFile(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({ type: 'module' }),
  );

  console.debug('Constructing path list...');

  const stack = await fg('**/*', {
    cwd: tmpDir,
    dot: true,
    onlyFiles: false,
    followSymbolicLinks: false,
  });
  const visited = new Set(stack);

  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dir = path.dirname(stack.pop()!);
    if (dir !== '.' && !visited.has(dir)) {
      visited.add(dir);
      stack.push(dir);
    }
  }

  const paths = [...visited].sort((a, b) => {
    const c = a.split('/').length;
    const d = b.split('/').length;

    return c === d ? a.localeCompare(b) : c - d;
  });

  console.debug('Creating deployment package...');

  // spell-checker:disable-next-line
  const entries: Record<string, fflate.AsyncZippableFile> = {};

  for (const src of paths) {
    const absolute = path.join(tmpDir, src);
    const stat = await fs.lstat(absolute);

    if (stat.isDirectory()) {
      entries[src] = [{}, { attrs: (0o755 << 16) | (1 << 4) }];
    } else if (stat.isFile()) {
      entries[src] = [await fs.readFile(absolute), { attrs: 0o755 << 16 }];
    } else if (stat.isSymbolicLink()) {
      entries[src] = [
        fflate.strToU8(await fs.readlink(absolute)),
        { attrs: (0o120 << 25) | (0o755 << 16) },
      ];
    }
  }

  const pkg = await new Promise<Uint8Array>((resolve, reject) => {
    fflate.zip(
      entries,
      { os: 3, mtime: '2000-01-01T00:00:00Z', level: 0 },
      (err, data) => {
        if (err) reject(err);
        else resolve(data);
      },
    );
  });

  await fs.writeFile(path.join(outDir, 'function.zip'), pkg);
  await fs.rm(tmpDir, { recursive: true, force: true });

  const hash = crypto.createHash('sha256').update(pkg).digest('base64');

  console.log();
  console.info(`Deployment package created to '${outDir}/function.zip'`);
  console.info(`Package size: ${pkg.length} bytes`);
  console.info(`Package hash: ${hash}`);
  console.info('Entrypoints are:');

  for (const entry of spec.entry) {
    console.info(`  - ${path.basename(entry)}`);
  }
};
