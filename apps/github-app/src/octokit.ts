import crypto from 'node:crypto';
import { App } from 'octokit';
import { getEnv } from './env';

const privateKey = crypto
  .createPrivateKey(await getEnv('GH_APP_PRIVATE_KEY'))
  .export({
    type: 'pkcs8',
    format: 'pem',
  })
  .toString();

const app = new App({
  appId: await getEnv('GH_APP_ID'),
  privateKey,
});

export const organization = await getEnv('GH_APP_ORGANIZATION');

const { data: installation } = await app.octokit.request('GET /orgs/{org}/installation', { org: organization });

export const octokit = await app.getInstallationOctokit(installation.id);
