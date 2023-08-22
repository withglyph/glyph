import { execa } from 'execa';

type Opt = {
  name: string;
  url: string;
  tokens: { registration: string; remove: string };
};

const run = async (options: Opt) => {
  try {
    console.log('Configuring runner...');
    await execa('./config.sh', [
      '--disableupdate',
      '--ephemeral',
      '--unattended',

      '--name',
      options.name,

      '--no-default-labels',
      '--labels',
      'linux/arm64',

      '--token',
      options.tokens.registration,

      '--url',
      options.url,
    ]);

    console.log('Running runner...');
    await execa('./run.sh', { stdout: 'inherit', stderr: 'inherit' });
  } catch (err) {
    console.error(err);
  } finally {
    console.log('Removing runner...');
    await execa('./config.sh', ['remove', '--token', options.tokens.remove]);
  }
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const options = JSON.parse(process.env.RUNNER_OPT!) as Opt;
await run(options);
