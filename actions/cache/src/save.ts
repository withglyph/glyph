import actions from '@actions/core';
import { $ } from 'execa';

const main = async () => {
  const cachePath = actions.getInput('path', { required: true });
  // const cacheKey = actions.getInput('key', { required: true });

  await $`zstd -19 -T0 -r ${cachePath} -o hello.zst`;

  actions.info('Hello World!');
};

await main();
