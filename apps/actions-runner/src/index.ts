import { execa } from 'execa';

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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const jitConfig = process.env.JIT_CONFIG!;

  console.log('Running runner...');
  await execa('./run.sh', ['--jitconfig', jitConfig], {
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
