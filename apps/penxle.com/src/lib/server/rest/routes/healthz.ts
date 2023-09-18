import { json } from 'itty-router';
import * as R from 'radash';
import { redis } from '$lib/server/cache';
import { createRouter } from '../router';
import type { InteractiveTransactionClient } from '$lib/server/prisma';

export const healthz = createRouter();

const checkDatabase = async (db: InteractiveTransactionClient) => {
  try {
    const r = await db.$queryRaw`SELECT 1 as _`;
    return R.isEqual(r, [{ _: 1 }]);
  } catch {
    return false;
  }
};

const checkRedis = async () => {
  try {
    const r = await redis.ping();
    return r === 'PONG';
  } catch {
    return false;
  }
};

healthz.get('/healthz', async (_, { db }) => {
  const result = await R.all({
    db: checkDatabase(db),
    redis: checkRedis(),
  });

  return json({
    _all: Object.values(result).every(Boolean),
    ...result,
  });
});
