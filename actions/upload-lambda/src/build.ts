import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import actions from '@actions/core';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { nodeFileTrace } from '@vercel/nft';
import fg from 'fast-glob';
import * as fflate from 'fflate';
import { getWorkspaceDir } from './utils';

const S3 = new S3Client();

type BuildParams = {
  stackName: string;
  lambdaName: string;
  projectPath: string;
  basePath: string;
  entrypointPath: string;
  assetsPath?: string;
};
export const build = async ({
  stackName,
  lambdaName,
  projectPath,
  basePath,
  entrypointPath,
  assetsPath,
}: BuildParams) => {
  actions.startGroup(
    `Building project '${lambdaName}' as a lambda function...`,
  );

  actions.info('Stack name: ' + stackName);
  actions.info('Lambda name: ' + lambdaName);
  actions.info('Project directory: ' + projectPath);
  actions.info('Base directory: ' + basePath);
  actions.info('Entrypoint path: ' + entrypointPath);
  actions.info('Assets path: ' + (assetsPath ?? '(none)'));
  actions.info('');

  const workspaceDir = await getWorkspaceDir();
  const projectDir = path.join(workspaceDir, projectPath);
  const baseDir = path.join(projectDir, basePath);

  const outDir = path.join(projectDir, '_lambda');

  await fs.mkdir(outDir, { recursive: true });

  actions.debug('Linking target files...');

  const handler = `
    export * from './${path.relative(
      workspaceDir,
      path.join(outDir, entrypointPath),
    )}';
  `;
  await fs.writeFile(path.join(workspaceDir, 'index.js'), handler);

  for (const src of await fg('**/*', { absolute: true, cwd: baseDir })) {
    const dst = path.join(outDir, path.relative(baseDir, src));
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.link(src, dst);
  }

  const assets = [];
  if (assetsPath) {
    const assetsDir = path.relative(
      workspaceDir,
      path.join(outDir, assetsPath),
    );
    const paths = await fg(path.join(assetsDir, '**/*'), { cwd: workspaceDir });
    assets.push(...paths);
  }

  actions.debug('Analyzing dependencies...');

  const traced = await nodeFileTrace([path.join(workspaceDir, 'index.js')], {
    base: workspaceDir,
  });

  for (const { message } of traced.warnings) {
    if (message.startsWith('Failed to resolve dependency')) {
      const m = /Cannot find module '(.+?)' loaded from (.+)/.exec(message);
      let [, mod, importer] = m ?? [null, message, '(unknown)'];

      if (mod.startsWith('/')) {
        mod = path.relative(workspaceDir, mod);
      }

      if (importer.startsWith('/')) {
        importer = path.relative(workspaceDir, importer);
      }

      const diag = `Missing dependency: ${mod} (imported by ${importer})`;
      if (importer.includes('node_modules')) {
        actions.warning(diag);
      } else {
        actions.error(diag);
      }
    }
  }

  actions.debug('Constructing path list...');

  const stack = [...traced.fileList, ...assets];
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

  actions.debug('Creating deployment package...');

  // spell-checker:disable-next-line
  const entries: Record<string, fflate.AsyncZippableFile> = {};

  for (const relative of paths) {
    const absolute = path.join(workspaceDir, relative);
    const stat = await fs.lstat(absolute);

    if (stat.isDirectory()) {
      entries[relative] = [{}, { attrs: (0o755 << 16) | (1 << 4) }];
    } else if (stat.isFile()) {
      entries[relative] = [await fs.readFile(absolute), { attrs: 0o755 << 16 }];
    } else if (stat.isSymbolicLink()) {
      entries[relative] = [
        fflate.strToU8(await fs.readlink(absolute)),
        { attrs: (0o120 << 25) | (0o755 << 16) },
      ];
    }
  }

  const pkg = await new Promise<Uint8Array>((resolve, reject) => {
    fflate.zip(
      entries,
      { os: 3, mtime: '2000-01-01T00:00:00Z', level: 9, mem: 0 },
      (err, data) => {
        if (err) reject(err);
        else resolve(data);
      },
    );
  });

  const hash = crypto.createHash('sha256').update(pkg).digest('base64');

  actions.debug('Uploading deployment package...');

  actions.info('');
  actions.info(`Package hash: ${hash}`);
  actions.info(`Package size: ${pkg.length} bytes`);

  const bundlePath = `lambda/${lambdaName}-${stackName}.zip`;

  await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-artifacts',
      Key: bundlePath,
      Body: pkg,
      ContentType: 'application/zip',
      Metadata: { Hash: hash },
    }),
  );

  actions.info('');
  actions.info(
    `Deployment package uploaded to 's3://penxle-artifacts/${bundlePath}'`,
  );

  actions.endGroup();
};
