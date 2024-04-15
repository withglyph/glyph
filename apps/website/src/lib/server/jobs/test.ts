import { defineJob } from './types';

export const TestJob = defineJob('test', async () => {
  console.log('hello');
});

export const Test2Job = defineJob('test2', async (payload: string) => {
  console.log('hello', payload);
});
