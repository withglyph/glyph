import { logger } from '$lib/server/logging';
import type { Prisma } from '@prisma/client';

const interpolateQuery = (query: string, params: unknown[]) => {
  return query
    .replaceAll(/\$(\d+)/g, (_, a) => {
      const param = params[a - 1];
      return typeof param === 'string' ? `'${param}'` : String(param);
    })
    .replaceAll('"', '')
    .replaceAll('public.', '');
};

export const logging = (e: Prisma.QueryEvent) => {
  logger.verbose(e.query, {
    scope: 'database',
    query: interpolateQuery(e.query, JSON.parse(e.params)),
    params: e.params,
    duration: e.duration,
  });
};
