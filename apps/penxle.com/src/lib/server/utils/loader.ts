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
