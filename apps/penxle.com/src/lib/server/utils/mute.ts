import type { InteractiveTransactionClient } from '$lib/server/database';

type GetMutedParams = {
  db: InteractiveTransactionClient;
  userId?: string;
};

export const getMutedSpaceIds = async ({ db, userId }: GetMutedParams): Promise<string[]> => {
  if (!userId) {
    return [];
  }

  const userSpaceMutes = await db.userSpaceMute.findMany({
    where: { userId },
  });

  return userSpaceMutes.map(({ spaceId }) => spaceId);
};

export const getMutedTagIds = async ({ db, userId }: GetMutedParams): Promise<string[]> => {
  if (!userId) {
    return [];
  }

  const userTagMutes = await db.userTagMute.findMany({
    where: { userId },
  });

  return userTagMutes.map(({ tagId }) => tagId);
};
