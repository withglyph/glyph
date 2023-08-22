import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import actions from '@actions/core';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { nodeFileTrace } from '@vercel/nft';
import esbuild from 'esbuild';
import Zip from 'jszip';

const S3 = new S3Client({ region: 'ap-northeast-2' });

type BundleParams = {
  lambdaName: string;
  projectDir: string;
  entrypointPath: string;
};
export const bundle = async ({
  lambdaName,
  projectDir,
  entrypointPath,
}: BundleParams) => {
  actions.info(`Bundling lambda ${lambdaName}...`);

  const outDir = path.join(projectDir, '_lambda');

  await fs.mkdir(outDir, { recursive: true });

  actions.info('Building source code...');

  await esbuild.build({
    entryPoints: { index: path.join(projectDir, entrypointPath) },
    outdir: outDir,

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

  actions.info('Analyzing dependencies...');

  const traced = await nodeFileTrace([path.join(outDir, 'index.js')]);

  for (const { message } of traced.warnings) {
    if (message.startsWith('Failed to resolve dependency')) {
      const m = /Cannot find module '(.+?)' loaded from (.+)/.exec(message);
      const [, module, importer] = m ?? [null, message, '(unknown)'];

      const diag = `Missing dependency: ${module} (imported by ${importer})`;
      if (importer.includes('node_modules')) {
        actions.warning(diag);
      } else {
        actions.error(diag);
      }
    }
  }

  actions.info('Creating function bundle...');

  const zip = new Zip();

  for (const filePath of [...traced.fileList].sort()) {
    const stat = await fs.lstat(filePath);

    if (stat.isSymbolicLink()) {
      const link = await fs.readlink(filePath);
      zip.file(filePath, link, {
        date: new Date('1970-01-01T00:00:00Z'),
        createFolders: false,
        unixPermissions: 0o12_0755,
      });
    } else if (stat.isFile()) {
      const buffer = await fs.readFile(filePath);
      zip.file(filePath, buffer, {
        date: new Date('1970-01-01T00:00:00Z'),
        createFolders: false,
        unixPermissions: 0o755,
      });
    }
  }

  const entry = `export * from './${path.join(outDir, 'index.js')}';`;
  zip.file('index.mjs', entry, {
    date: new Date('1970-01-01T00:00:00Z'),
    createFolders: false,
    unixPermissions: 0o755,
  });

  const bundle = await zip.generateAsync({
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    type: 'nodebuffer',
    platform: 'UNIX',
  });

  const hash = crypto.createHash('sha256').update(bundle).digest('base64');

  actions.info('Uploading final assets...');

  await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-artifacts',
      Key: `lambda/${lambdaName}/function.zip`,
      Body: bundle,
      ContentType: 'application/zip',
    }),
  );

  await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-artifacts',
      Key: `lambda/${lambdaName}/hash.txt`,
      Body: hash,
      ContentType: 'text/plain',
    }),
  );
};
