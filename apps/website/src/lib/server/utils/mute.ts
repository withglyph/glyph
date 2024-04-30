import { eq } from 'drizzle-orm';
import { useCache } from '../cache';
import { database, UserSpaceMutes, UserTagMutes } from '../database';

type GetMutedParams = {
  userId?: string;
};

export const getMutedSpaceIds = async ({ userId }: GetMutedParams): Promise<string[]> => {
  if (!userId) {
    return [];
  }

  return await useCache(
    `mutedSpaceIds:${userId}`,
    () =>
      database
        .select({ spaceId: UserSpaceMutes.spaceId })
        .from(UserSpaceMutes)
        .where(eq(UserSpaceMutes.userId, userId))
        .then((result) => result.map(({ spaceId }) => spaceId)),
    60 * 60,
  );
};

export const getMutedTagIds = async ({ userId }: GetMutedParams): Promise<string[]> => {
  if (!userId) {
    return [];
  }

  return await useCache(
    `mutedTagIds:${userId}`,
    () =>
      database
        .select({ tagId: UserTagMutes.tagId })
        .from(UserTagMutes)
        .where(eq(UserTagMutes.userId, userId))
        .then((result) => result.map(({ tagId }) => tagId)),
    60 * 60,
  );
};
