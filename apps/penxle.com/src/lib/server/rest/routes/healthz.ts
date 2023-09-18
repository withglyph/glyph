import { json } from 'itty-router';
import * as R from 'radash';
import { createRouter } from '../router';
import type { InteractiveTransactionClient } from '$lib/server/prisma';

export const healthz = createRouter();

const checkDatabase = async (db: InteractiveTransactionClient) => {
  try {
    const d = await db.$queryRaw`SELECT 1 as _`;
    return R.isEqual(d, [{ _: 1 }]);
  } catch {
    return false;
  }
};

healthz.get('/healthz', async (_, { db }) => {
  const result = await R.all({
    db: checkDatabase(db),
  });

  return json({
    _all: Object.values(result).every(Boolean),
    ...result,
  });
});
