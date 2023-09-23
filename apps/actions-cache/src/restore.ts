import fs from 'node:fs/promises';
import path from 'node:path';
import utils from '@actions/cache/lib/internal/cacheUtils';
import { extractTar } from '@actions/cache/lib/internal/tar';
import actions from '@actions/core';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const S3 = new S3Client();

const main = async () => {
  const key = actions.getInput('key', { required: true });
  const restoreKeys = actions
    .getInput('restore-keys')
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => !!p);

  actions.saveState('key', key);

  let object;
  try {
    object = await S3.send(
      new GetObjectCommand({
        Bucket: 'penxle-artifacts',
        Key: `actions-cache/${key}`,
      }),
    );

    actions.saveState('exact-matched', 'true');
    actions.info('Cache found (exact match)');
  } catch {
    for (const restoreKey of restoreKeys) {
      const objects = await S3.send(
        new ListObjectsV2Command({
          Bucket: 'penxle-artifacts',
          Prefix: `actions-cache/${restoreKey}`,
        }),
      );

      if (!objects.Contents?.length) {
        continue;
      }

      const latest = objects.Contents.sort(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (a, b) => b.LastModified!.getTime() - a.LastModified!.getTime(),
      )[0];

      object = await S3.send(
        new GetObjectCommand({
          Bucket: 'penxle-artifacts',
          Key: latest.Key,
        }),
      );

      actions.info(`Cache found (restore key: ${restoreKey})`);

      break;
    }
  }

  if (!object) {
    actions.info('Cache not found');
    return;
  }

  const compressionMethod = await utils.getCompressionMethod();
  const cacheFileName = utils.getCacheFileName(compressionMethod);
  const archivePath = path.join(await utils.createTempDirectory(), cacheFileName);

  actions.info('Downloading cache...');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await fs.writeFile(archivePath, await object.Body!.transformToByteArray());

  actions.info('Extracting cache...');
  await extractTar(archivePath, compressionMethod);

  actions.info('Cache restored successfully');
};

await main();
