import * as Sentry from '@sentry/sveltekit';
import { stack } from '@withglyph/lib/environment';
import { nanoid } from 'nanoid';
import { building, dev } from '$app/environment';
import { pub, rabbit } from '../mq';
import { finalizeResource, setResourceFinalizer } from '../utils';
import { IndexAllPostsInSpaceJob, IndexCollectionJob, IndexPostJob } from './search';
import type { JobFn } from './types';

const jobs = [IndexAllPostsInSpaceJob, IndexPostJob, IndexCollectionJob];

type Jobs = typeof jobs;
type JobNames = Jobs[number]['name'];
type JobMap = { [Job in Jobs[number] as Job['name']]: Job['fn'] };
type Body = { name: JobNames; payload: unknown; meta: { retry: number } };

const exchange = 'jobs';
const queue = dev ? `jobs:local:${nanoid()}` : `jobs:${stack}`;
const routingKey = queue;

const startWorker = async () => {
  await finalizeResource('jobs');

  await rabbit.exchangeDeclare({ exchange, type: 'direct' });

  const jobMap = Object.fromEntries(jobs.map((job) => [job.name, job.fn])) as JobMap;
  const sub = rabbit.createConsumer(
    {
      queue,
      queueOptions: { exclusive: dev },
      queueBindings: [{ exchange, queue, routingKey }],
    },
    async (msg) => {
      const { name, payload, meta } = msg.body as Body;
      try {
        await jobMap[name]?.(payload as never);
      } catch (err: unknown) {
        if (meta.retry < 3) {
          try {
            const body = { name, payload, meta: { retry: meta.retry + 1 } } satisfies Body;
            await pub.send({ exchange, routingKey }, body);
            return;
          } catch {
            // pass
          }
        }

        Sentry.captureException(err);
        console.error(err);
      }
    },
  );

  setResourceFinalizer('jobs', async () => {
    await sub.close();
  });
};

export const enqueueJob = async <N extends JobNames, F extends JobMap[N]>(
  name: N,
  payload: F extends JobFn<infer P> ? P : never,
) => {
  const body = { name, payload, meta: { retry: 0 } } satisfies Body;
  await pub.send({ exchange, routingKey }, body);
};

if (!building) {
  startWorker();
}
