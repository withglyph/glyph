import type { Context } from '../context';
import type { InteractiveTransactionClient } from '../prisma';

type LoaderParams = {
  context: Pick<Context, 'dataLoader'>;
  db: InteractiveTransactionClient;
};

export const spaceMember = ({ db, context }: LoaderParams & { context: Pick<Context, 'session'> }) =>
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
