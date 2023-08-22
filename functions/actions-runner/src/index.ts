import { execaSync } from 'execa';
import exitHook from 'exit-hook';

type Event = {
  name: string;
  url: string;
  tokens: { registration: string; remove: string };
};

export const handler = (event: Event) => {
  console.log('Configuring runner...');
  execaSync('./config.sh', [
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
  ]);

  exitHook(() => {
    console.log('Removing runner...');
    execaSync('./config.sh', ['remove', '--token', event.tokens.remove]);
  });

  console.log('Running runner...');
  execaSync('./run.sh', { stdout: 'inherit', stderr: 'inherit' });
};
