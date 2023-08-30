import fs from 'node:fs/promises';
import path from 'node:path';
import { nodeFileTrace } from '@vercel/nft';
import fg from 'fast-glob';
import { getLambdaSpec, getWorkspaceDir } from './utils';
import type { LambdaSpec } from './utils';

export const lambdify = async (spec?: LambdaSpec) => {
  const workspaceDir = await getWorkspaceDir();
  const projectDir = process.cwd();

  const outDir = path.join(projectDir, '.lambda');
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

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
    const dst = path.join(outDir, path.relative(workspaceDir, src));
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
    await fs.writeFile(path.join(outDir, path.basename(entry)), code);
  }

  await fs.writeFile(
    path.join(outDir, 'package.json'),
    JSON.stringify({ type: 'module' }),
  );

  console.log();
  console.info(`Deployment package created to '${outDir}'`);
  console.info('Entrypoints are:');

  for (const entry of spec.entry) {
    console.info(`  - ${path.basename(entry)}`);
  }
};
