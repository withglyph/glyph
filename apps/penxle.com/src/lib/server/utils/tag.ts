import * as R from 'radash';
import { useCache } from '../cache';
import { prismaClient } from '../database';

export const getTagUsageCount = (tagId: string) => {
  return useCache(
    `Tag:${tagId}:usageCount`,
    async () =>
      prismaClient.postTag
        .groupBy({
          by: ['kind'],
          where: {
            tagId,
            post: { state: 'PUBLISHED' },
          },
          _count: true,
        })
        .then((result) =>
          R.objectify(
            result,
            (r) => r.kind,
            (r) => r._count,
          ),
        ),
    60 * 60,
  );
};
