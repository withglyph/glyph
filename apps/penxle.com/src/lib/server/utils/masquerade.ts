import { createId, generateRandomName } from '$lib/utils';
import { createRandomIcon } from './icon';
import { directUploadImage } from './image';
import type { Prisma, PrismaClient } from '$prisma';
import type { InteractiveTransactionClient } from '../prisma';

type SpaceMasqueradeQuery = {
  include?: Prisma.SpaceMasqueradeInclude;
  select?: Prisma.SpaceMasqueradeSelect;
};

type MakeMasqueradeParams<T extends SpaceMasqueradeQuery> = {
  db: InteractiveTransactionClient;
  spaceId: string;
  userId: string;
  query?: T;
};

export const makeMasquerade = async <T extends SpaceMasqueradeQuery>({
  db,
  spaceId,
  userId,
  query,
}: MakeMasqueradeParams<T>): Promise<Prisma.Result<PrismaClient['spaceMasquerade'], T, 'upsert'>> => {
  let masquerade = await db.spaceMasquerade.findUnique({
    ...query,
    where: { spaceId_userId: { spaceId, userId } },
  });

  if (!masquerade) {
    const profileImageId = await directUploadImage({
      db,
      userId,
      name: 'icon',
      source: await createRandomIcon(),
    });

    masquerade = await db.spaceMasquerade.create({
      ...query,
      data: {
        id: createId(),
        user: { connect: { id: userId } },
        space: { connect: { id: spaceId } },
        profile: {
          create: {
            id: createId(),
            name: generateRandomName(spaceId + userId),
            avatarId: profileImageId,
          },
        },
      },
    });
  }

  // @ts-expect-error 위에서 query로 적당히 타입에 맞게 리턴해줌
  return masquerade;
};
