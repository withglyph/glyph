import crypto from 'node:crypto';
import { createId } from '@paralleldrive/cuid2';
import { execaSync } from 'execa';
import exitHook from 'exit-hook';
import { App } from 'octokit';

const privateKey = crypto
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  .createPrivateKey(process.env.GH_APP_PRIVATE_KEY!)
  .export({
    type: 'pkcs8',
    format: 'pem',
  })
  .toString();

const { octokit, getInstallationOctokit } = new App({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  appId: process.env.GH_APP_ID!,
  privateKey: privateKey,
});

console.log('Authenticating as app...');
const { data: app } = await octokit.request('GET /app');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const owner = app.owner!;

console.log('Authenticating as installation...');
const { data: installation } = await octokit.request(
  'GET /orgs/{org}/installation',
  { org: owner.login },
);

const installationOctokit = await getInstallationOctokit(installation.id);

console.log('Getting registration token...');
const { data: registrationToken } = await installationOctokit.request(
  'POST /orgs/{org}/actions/runners/registration-token',
  { org: owner.login },
);

console.log('Getting remove token...');
const { data: removeToken } = await installationOctokit.request(
  'POST /orgs/{org}/actions/runners/remove-token',
  { org: owner.login },
);

console.log('Configuring runner...');
execaSync('./config.sh', [
  '--disableupdate',
  '--ephemeral',
  '--unattended',

  '--name',
  `${owner.login}-${createId()}`,

  '--no-default-labels',
  '--labels',
  'linux/arm64',

  '--token',
  registrationToken.token,

  '--url',
  owner.html_url,
]);

exitHook(() => {
  console.log('Removing runner...');
  execaSync('./config.sh', ['remove', '--token', removeToken.token]);
});

console.log('Running runner...');
execaSync('./run.sh', { stdout: 'inherit', stderr: 'inherit' });
