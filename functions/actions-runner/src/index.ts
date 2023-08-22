import { execaSync } from 'execa';

type Event = {
  name: string;
  url: string;
  tokens: { registration: string; remove: string };
};

export const handler = (event: Event) => {
  try {
    console.log('Copying files...');
    execaSync('cp', ['-r', '/runner', '/tmp']);

    console.log('Configuring runner...');
    execaSync(
      './config.sh',
      [
        '--disableupdate',
        '--ephemeral',
        '--unattended',

        '--name',
        event.name,

        '--no-default-labels',
        '--labels',
        'linux/arm64',

        '--token',
        event.tokens.registration,

        '--url',
        event.url,
      ],
      { cwd: '/tmp/runner' },
    );

    console.log('Running runner...');
    execaSync('./run.sh', {
      cwd: '/tmp/runner',
      stdout: 'inherit',
      stderr: 'inherit',
    });
  } catch (err) {
    console.error(err);
  } finally {
    console.log('Removing runner...');
    execaSync('./config.sh', ['remove', '--token', event.tokens.remove], {
      cwd: '/tmp/runner',
    });
  }

  return {};
};
