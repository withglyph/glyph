import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import actions from '@actions/core';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getProjectDir } from './utils';

const S3 = new S3Client();

const projectName = actions.getInput('project');
const stackName = actions.getInput('stack');

const projectDir = await getProjectDir(projectName);
actions.setOutput('project-dir', projectDir);

const pkg = await fs.readFile(path.join(projectDir, '.lambda/function.zip'));
const hash = crypto.createHash('sha256').update(pkg).digest('base64');

actions.debug('Uploading deployment package...');

actions.info('');
actions.info(`Package hash: ${hash}`);
actions.info(`Package size: ${pkg.length} bytes`);

const normalizedName = projectName.replaceAll('.', '_');
const packagePath = `lambda/${normalizedName}-${stackName}.zip`;

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
actions.info(
  `Deployment package uploaded to 's3://penxle-artifacts/${packagePath}'`,
);
