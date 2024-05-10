import { and, eq } from 'drizzle-orm';
import { database, inArray, SpaceMembers } from '../database';
import type { Context } from '../context';

export const getSpaceMember = async (context: Context, spaceId: string) => {
  const loader = context.loader({
    name: 'spaceMemberBySpaceId',
    nullable: true,
    load: async (spaceIds: string[]) => {
      if (!context.session) {
        return [];
      }

      return await database
        .select({ SpaceMembers })
        .from(SpaceMembers)
        .where(
          and(
            inArray(SpaceMembers.spaceId, spaceIds),
            eq(SpaceMembers.userId, context.session.userId),
            eq(SpaceMembers.state, 'ACTIVE'),
          ),
        )
        .then((rows) => rows.map((row) => row.SpaceMembers));
    },
    key: (row) => row?.spaceId,
  });

  return await loader.load(spaceId);
};
