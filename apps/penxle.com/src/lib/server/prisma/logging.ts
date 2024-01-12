import { logger } from '$lib/server/logging';
import type { Prisma } from '$prisma';

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
  logger.trace({
    context: 'database',
    query: interpolateQuery(e.query, JSON.parse(e.params)),
    duration: e.duration,
  });
};
