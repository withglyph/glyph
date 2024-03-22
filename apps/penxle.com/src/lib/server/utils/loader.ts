import DataLoader from 'dataloader';
import * as R from 'radash';
import { redis } from '../cache';
import type { Prisma } from '../../../../.prisma';
import type { Context } from '../context';
import type { InteractiveTransactionClient } from '../prisma';

type LoaderParams = {
  context: Pick<Context, 'dataLoader'>;
  db: InteractiveTransactionClient;
};

type SessionContext = { context: Pick<Context, 'session'> };

export const spaceMember = ({ db, context }: LoaderParams & SessionContext) =>
  context.dataLoader('spaceMember', async (spaceIds) => {
    if (!context.session) return spaceIds.map(() => null);
    const spaceMembers = await db.spaceMember.findMany({
      where: {
        spaceId: { in: spaceIds as string[] },
        userId: context.session.userId,
        state: 'ACTIVE',
      },
    });

    return spaceIds.map((spaceId) => spaceMembers.find((member) => member.spaceId === spaceId));
  });

export const post = ({ db, context }: LoaderParams) =>
  context.dataLoader('post', async (postIds) => {
    const posts = await db.post.findMany({
      where: { id: { in: postIds as string[] } },
    });

    return postIds.map((postId) => posts.find((post) => post.id === postId));
  });

export const spaceMasquerade = ({ db, context }: LoaderParams & SessionContext) =>
  context.dataLoader('spaceMasquerade', async (spaceIds) => {
    if (!context.session) return spaceIds.map(() => null);
    const spaceMasquerades = await db.spaceMasquerade.findMany({
      where: {
        spaceId: { in: spaceIds as string[] },
        userId: context.session.userId,
      },
    });

    return spaceIds.map((spaceId) => spaceMasquerades.find((masquerade) => masquerade.spaceId === spaceId));
  });

export const image = ({ db }: { db: InteractiveTransactionClient }) =>
  new DataLoader(async (imageIds: readonly string[]) => {
    const imageData = await redis.mget(imageIds.map((id) => `image:${id}`));

    const cacheMissedIds = R.sift(imageData.map((data, index) => (data ? null : imageIds[index])));

    const cacheMissedImages = R.objectify(
      await db.image.findMany({
        where: { id: { in: cacheMissedIds } },
      }),
      (image) => image.id,
    );

    return imageIds.map((imageId, index) => {
      const cachedImage = imageData[index];
      if (cachedImage) {
        return JSON.parse(cachedImage) as Prisma.ImageGetPayload<Record<never, void>>;
      }

      const image = cacheMissedImages[imageId];

      if (image) {
        redis.setex(`image:${imageId}`, 60 * 60 * 24, JSON.stringify(image)).catch(() => null);
        return image;
      }
      return null;
    });
  });
