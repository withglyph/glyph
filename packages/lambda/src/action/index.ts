import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import actions from '@actions/core';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const S3 = new S3Client();

const appName = actions.getInput('app');
const stackName = actions.getInput('stack');

const appDir = path.resolve('apps', appName);

const pkg = await fs.readFile(path.join(appDir, '.lambda/function.zip'));
const hash = crypto.createHash('sha256').update(pkg).digest('base64');

actions.debug('Uploading deployment package...');

actions.info('');
actions.info(`Package hash: ${hash}`);
actions.info(`Package size: ${pkg.length} bytes`);

const normalizedName = appName.replaceAll('.', '-');
const packagePath = `lambda/${stackName}--${normalizedName}.zip`;

await S3.send(
  new PutObjectCommand({
    Bucket: 'penxle-artifacts',
    Key: packagePath,
    Body: pkg,
    ContentType: 'application/zip',
    Metadata: { Hash: hash },
  }),
);

actions.info('');
actions.info(`Deployment package uploaded to 's3://penxle-artifacts/${packagePath}'`);
