import { and, eq, inArray } from 'drizzle-orm';
import { database, Posts, SpaceMembers } from '../database';
import type { Context } from '../context';

type LoaderContext = Pick<Context, 'loader' | 'session'>;

export const spaceMemberBySpaceId = (context: LoaderContext) =>
  context.loader({
    name: 'spaceMemberBySpaceId',
    nullable: true,
    load: async (spaceIds: string[]) => {
      if (!context.session) {
        return [];
      }

      return await database
        .select({ SpaceMembers })
        .from(SpaceMembers)
        .where(and(inArray(SpaceMembers.spaceId, spaceIds), eq(SpaceMembers.userId, context.session.userId)))
        .then((rows) => rows.map((row) => row.SpaceMembers));
    },
    key: (row) => row?.spaceId,
  });

export const postById = (context: LoaderContext) =>
  context.loader({
    name: 'postById',
    load: async (postIds: string[]) => {
      return await database
        .select({ Posts })
        .from(Posts)
        .where(inArray(Posts.id, postIds))
        .then((rows) => rows.map((row) => row.Posts));
    },
    key: (row) => row.id,
  });
