import crypto from 'node:crypto';
import { execa } from 'execa';
import { getOctokit } from './octokit';

const main = async () => {
  const octokit = await getOctokit();
  const id = crypto.randomBytes(4).toString('hex');

  const { data: jitConfig } = await octokit.request('POST /orgs/{org}/actions/runners/generate-jitconfig', {
    org: 'penxle',
    name: `penxle-${id}`,
    labels: ['node18/arm64'],
    runner_group_id: 1,
  });

  await execa('./run.sh', ['--jitconfig', jitConfig.encoded_jit_config], {
    stdio: 'inherit',
  });
};

main();
