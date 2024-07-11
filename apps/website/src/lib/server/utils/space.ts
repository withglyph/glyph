import { and, eq } from 'drizzle-orm';
import { database, inArray, Profiles, SpaceMembers } from '../database';
import { Profile } from '../graphql/schemas/user';
import { useFirstRow, useFirstRowOrThrow } from './database';
import { makeMasquerade } from './masquerade';
import type { Context } from '../context';

export const getSpaceMember = async (context: Context, spaceId: string | null | undefined) => {
  if (!spaceId) {
    return null;
  }

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

type GetSpaceMemberParams = {
  context?: Context;
  spaceId: string;
  userId?: string;
};

export const getSpaceMemberV2 = async ({ context, spaceId, ...params }: GetSpaceMemberParams) => {
  const userId = params.userId ?? context?.session?.userId;

  if (!userId) {
    return null;
  }

  if (context) {
    return await context
      .loader({
        name: 'spaceMember(spaceId)',
        nullable: true,
        load: async (spaceIds: string[]) => {
          return await database
            .select({ SpaceMembers })
            .from(SpaceMembers)
            .where(
              and(
                inArray(SpaceMembers.spaceId, spaceIds),
                eq(SpaceMembers.userId, userId),
                eq(SpaceMembers.state, 'ACTIVE'),
              ),
            )
            .then((rows) => rows.map((row) => row.SpaceMembers));
        },
        key: (row) => row?.spaceId,
      })
      .load(spaceId);
  } else {
    return await database
      .select()
      .from(SpaceMembers)
      .where(and(eq(SpaceMembers.spaceId, spaceId), eq(SpaceMembers.userId, userId), eq(SpaceMembers.state, 'ACTIVE')))
      .then(useFirstRow);
  }
};

type GetSpaceProfileParams =
  | {
      context: Context;
      spaceId: string;
      userId?: string;
    }
  | {
      spaceId: string;
      userId: string;
    };

export const getSpaceProfile = async (params: GetSpaceProfileParams) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const userId = 'context' in params ? params.userId ?? params.context.session!.userId : params.userId;

  const { profileId } = (await getSpaceMemberV2(params)) ?? (await makeMasquerade({ spaceId: params.spaceId, userId }));

  return await ('context' in params
    ? Profile.getDataloader(params.context).load(profileId)
    : database.select().from(Profiles).where(eq(Profiles.id, profileId)).then(useFirstRowOrThrow()));
};
