import crypto from 'node:crypto';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { App } from 'octokit';

const SSM = new SSMClient();

const getEnv = async (name: string) => {
  const resp = await SSM.send(
    new GetParameterCommand({
      Name: `/github-app/${name}`,
      WithDecryption: true,
    }),
  );

  if (!resp.Parameter?.Value) {
    throw new Error(`Parameter ${name} not found`);
  }

  return resp.Parameter.Value;
};

export const getOctokit = async () => {
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

  const { data: installation } = await app.octokit.request('GET /orgs/{org}/installation', { org: 'penxle' });

  return await app.getInstallationOctokit(installation.id);
};
