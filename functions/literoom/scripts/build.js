import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { $ } from 'execa';
import glob from 'fast-glob';
import Zip from 'jszip';
import { rimraf } from 'rimraf';
import { build } from 'tsup';

const S3 = new S3Client({ region: 'ap-northeast-2' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../dist');
const buildDir = path.join(outDir, 'build');
const artifactDir = path.join(outDir, 'archives');
const dockerName = `literoom-layer-${crypto.randomUUID()}`;
const dockerFile = `
FROM --platform=linux/arm64 node:18
WORKDIR /build
RUN npm install --no-save sharp
`;

console.log('Initializing environment...');
await rimraf(outDir);
await fs.mkdir(outDir);
await fs.mkdir(buildDir);
await fs.mkdir(artifactDir);
await fs.writeFile(path.join(buildDir, 'Dockerfile'), dockerFile);

console.log('Building docker image...');
await $`docker build --tag ${dockerName} ${buildDir}`;
await $`docker create --name ${dockerName} ${dockerName}`;

console.log('Copying resources...');
await $`docker cp ${dockerName}:/build ${buildDir}/nodejs`;

console.log('Building functions...');
await build({
  entry: ['src/handlers/*.ts'],
  format: 'esm',
  silent: true,
  minify: true,
  splitting: false,
  external: ['sharp'],
});

console.log('Creating archives...');
const zip = new Zip();
const entries = await glob('nodejs/**/*', { cwd: path.join(buildDir) });
for (const entry of entries.sort()) {
  const body = await fs.readFile(path.join(buildDir, entry));
  zip.file(entry, body, {
    createFolders: false,
    date: new Date('1970-01-01T00:00:00Z'),
  });
}
const buffer = await zip.generateAsync({
  compression: 'STORE',
  type: 'nodebuffer',
});
const hash = crypto.createHash('sha256').update(buffer).digest('base64');
await fs.writeFile(path.join(artifactDir, 'layer.zip'), buffer);
await fs.writeFile(path.join(artifactDir, 'layer.hash'), hash);
for (const entry of await glob('*.js', { cwd: outDir })) {
  const basename = path.basename(entry, '.js');
  const body = await fs.readFile(path.join(outDir, entry));
  const zip = new Zip();
  zip.file('index.mjs', body, {
    createFolders: false,
    date: new Date('1970-01-01T00:00:00Z'),
  });
  const buffer = await zip.generateAsync({
    compression: 'STORE',
    type: 'nodebuffer',
  });
  const hash = crypto.createHash('sha256').update(buffer).digest('base64');
  await fs.writeFile(path.join(artifactDir, `${basename}.zip`), buffer);
  await fs.writeFile(path.join(artifactDir, `${basename}.hash`), hash);
}

console.log('Uploading artifacts...');
for (const entry of await glob('*', { cwd: artifactDir })) {
  const body = await fs.readFile(path.join(artifactDir, entry));

  await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-artifacts',
      Key: path.join('literoom', entry),
      Body: body,
      ContentType: entry.endsWith('.zip') ? 'application/zip' : 'text/plain',
    }),
  );
}

console.log('Cleaning up...');
await $`docker rmi ${dockerName}`;
await $`docker rm ${dockerName}`;
await rimraf(buildDir);
