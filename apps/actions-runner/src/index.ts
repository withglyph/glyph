import { init } from '@paralleldrive/cuid2';
import { execa } from 'execa';
import { octokit } from './octokit';

const createId = init({ length: 8 });

const main = async () => {
  try {
    await Promise.race([run(), timeout()]);
  } catch (err) {
    console.log(err);
  }

  console.log('Exiting container...');
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

const run = async () => {
  const { data: jitConfig } = await octokit.request(
    'POST /orgs/{org}/actions/runners/generate-jitconfig',
    {
      org: 'penxle',
      name: `penxle-${createId()}`,
      labels: ['self-hosted', 'linux', 'arm64'],
      runner_group_id: 4, // penxle
    },
  );

  console.log('Running runner...');
  await execa('./run.sh', ['--jitconfig', jitConfig.encoded_jit_config], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
};

const timeout = async () => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timed out')), 10 * 60 * 1000); // 10 minutes
  });
};

await main();
