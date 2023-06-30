import { logger } from '$lib/logging';
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
  if (/^(SELECT|INSERT|UPDATE|DELETE)/.test(e.query)) {
    logger.trace({
      context: 'database',
      query: interpolateQuery(e.query, JSON.parse(e.params)),
      duration: e.duration,
    });
  }
};
