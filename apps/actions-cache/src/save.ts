import fs from 'node:fs/promises';
import path from 'node:path';
import utils from '@actions/cache/lib/internal/cacheUtils';
import { createTar } from '@actions/cache/lib/internal/tar';
import actions from '@actions/core';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const S3 = new S3Client();

const main = async () => {
  const key = actions.getState('key');
  const paths = actions
    .getInput('path')
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => !!p);

  const exactMatched = actions.getState('exact-matched');
  if (exactMatched === 'true') {
    actions.info('Cache already exists. Skipping...');
    return;
  }

  const compressionMethod = await utils.getCompressionMethod();
  const cachePaths = await utils.resolvePaths(paths);

  const archiveFolder = await utils.createTempDirectory();
  const cacheFileName = utils.getCacheFileName(compressionMethod);
  const archivePath = path.join(archiveFolder, cacheFileName);

  actions.info('Archiving cache...');
  await createTar(archiveFolder, cachePaths, compressionMethod);

  actions.info('Uploading cache...');
  await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-artifacts',
      Key: `actions-cache/${key}`,
      Body: await fs.readFile(archivePath),
    }),
  );

  actions.info('Cache saved successfully');
};

await main();
