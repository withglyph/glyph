import { and, eq } from 'drizzle-orm';
import { NotFoundError } from '$lib/errors';
import { database, dbEnum, PostTagKind, PostTags, TagFollows, Tags, UserTagMutes } from '$lib/server/database';
import { getTagUsageCount } from '$lib/server/utils';
import { builder } from '../builder';
import { makeLoadableObjectFields } from '../utils';
import { Post } from './post';

/**
 * * Types
 */

class TagUsageCount {
  TITLE?: number;
  COUPLING?: number;
  CHARACTER?: number;
  TRIGGER?: number;
  EXTRA?: number;
}

builder.objectType(TagUsageCount, {
  name: 'TagUsageCount',
  fields: (t) => ({
    TITLE: t.int({ resolve: ({ TITLE }) => TITLE ?? 0 }),
    COUPLING: t.int({ resolve: ({ COUPLING }) => COUPLING ?? 0 }),
    CHARACTER: t.int({ resolve: ({ CHARACTER }) => CHARACTER ?? 0 }),
    TRIGGER: t.int({ resolve: ({ TRIGGER }) => TRIGGER ?? 0 }),
    EXTRA: t.int({ resolve: ({ EXTRA }) => EXTRA ?? 0 }),
  }),
});

export const Tag = builder.loadableObject('Tag', {
  ...makeLoadableObjectFields(Tags),
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    usageCount: t.field({
      type: TagUsageCount,
      resolve: (tag) => getTagUsageCount(tag.id),
    }),

    // posts: t.prismaField({
    //   type: ['Post'],
    //   resolve: async (query, tag, input, { db, ...context }) => {
    //     const [mutedTags, mutedSpaces] = await Promise.all([
    //       context.session
    //         ? await db.userTagMute.findMany({
    //             where: { userId: context.session.userId },
    //           })
    //         : [],
    //       context.session
    //         ? await db.userSpaceMute.findMany({
    //             where: { userId: context.session.userId },
    //           })
    //         : [],
    //     ]);

    //     const searchResult = await elasticSearch.search({
    //       index: indexName('posts'),
    //       query: {
    //         bool: {
    //           filter: {
    //             bool: {
    //               must: [{ term: { 'tags.id': tag.id } }],
    //               must_not: makeQueryContainers([
    //                 {
    //                   query: {
    //                     terms: { ['tags.id']: mutedTags.map(({ tagId }) => tagId) },
    //                   },
    //                   condition: mutedTags.length > 0,
    //                 },
    //                 {
    //                   query: {
    //                     terms: { spaceId: mutedSpaces.map(({ spaceId }) => spaceId) },
    //                   },
    //                   condition: mutedSpaces.length > 0,
    //                 },
    //               ]),
    //             },
    //           },
    //         },
    //       },

    //       sort: [{ publishedAt: 'desc' }],
    //     });

    //     return searchResultToPrismaData({
    //       searchResult,
    //       db,
    //       tableName: 'post',
    //       queryArgs: {
    //         ...query,
    //         where: {
    //           state: 'PUBLISHED',
    //           space: {
    //             state: 'ACTIVE',
    //             visibility: 'PUBLIC',
    //           },
    //         },
    //       },
    //     });
    //   },
    // }),

    followed: t.boolean({
      resolve: async (tag, _, context) => {
        if (!context.session) {
          return false;
        }

        const follows = await database
          .select({ id: TagFollows.id })
          .from(TagFollows)
          .where(and(eq(TagFollows.tagId, tag.id), eq(TagFollows.userId, context.session.userId)));

        return follows.length > 0;
      },
    }),

    muted: t.boolean({
      resolve: async (tag, _, context) => {
        if (!context.session) {
          return false;
        }

        const mutes = await database
          .select({ id: UserTagMutes.id })
          .from(UserTagMutes)
          .where(and(eq(UserTagMutes.tagId, tag.id), eq(UserTagMutes.userId, context.session.userId)));

        return mutes.length > 0;
      },
    }),
  }),
});

export const PostTag = builder.loadableObject('PostTag', {
  ...makeLoadableObjectFields(PostTags),
  fields: (t) => ({
    id: t.exposeID('id'),
    kind: t.expose('kind', { type: dbEnum(PostTagKind) }),

    post: t.field({
      type: Post,
      resolve: (postTag) => postTag.postId,
    }),

    tag: t.field({
      type: Tag,
      resolve: (postTag) => postTag.tagId,
    }),
  }),
});

/**
 * * Inputs
 */

const MuteTagInput = builder.inputType('MuteTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

const UnmuteTagInput = builder.inputType('UnmuteTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

const FollowTagInput = builder.inputType('FollowTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

const UnfollowTagInput = builder.inputType('UnfollowTagInput', {
  fields: (t) => ({
    tagId: t.id(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  tag: t.field({
    type: Tag,
    args: { name: t.arg.string() },
    resolve: async (_, args) => {
      const tags = await database.select({ id: Tags.id }).from(Tags).where(eq(Tags.name, args.name));

      if (tags.length === 0) {
        throw new NotFoundError();
      }

      return tags[0].id;
    },
  }),

  // recommendedTags: t.prismaField({
  //   type: ['Tag'],
  //   resolve: async (query, _, __, { db, ...context }) => {
  //     if (context.session) {
  //       const data = await db.postView.findMany({
  //         select: {
  //           post: {
  //             select: {
  //               tags: {
  //                 select: { tag: query },
  //                 where: {
  //                   kind: { not: 'TRIGGER' },
  //                   tag: {
  //                     followers: {
  //                       none: { userId: context.session?.userId },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         where: { userId: context.session.userId },
  //         orderBy: { viewedAt: 'desc' },
  //         take: 50,
  //       });

  //       const rawTags = data.flatMap(({ post }) => post.tags.map(({ tag }) => tag));
  //       // eslint-disable-next-line unicorn/no-array-reduce
  //       const tagUsage = rawTags.reduce(
  //         (acc, tag) => {
  //           if (!acc[tag.id]) {
  //             acc[tag.id] = 0;
  //           }
  //           acc[tag.id] += 1;
  //           return acc;
  //         },
  //         {} as Record<string, number>,
  //       );

  //       const tags = R.unique(rawTags, (tag) => tag.id).sort((a, b) => tagUsage[b.id] - tagUsage[a.id]);

  //       return tags.slice(0, 10);
  //     } else {
  //       return [];
  //     }
  //   },
  // }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  muteTag: t.withAuth({ user: true }).field({
    type: Tag,
    args: { input: t.arg({ type: MuteTagInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .insert(UserTagMutes)
        .values({ userId: context.session.userId, tagId: input.tagId })
        .onConflictDoNothing();

      return input.tagId;
    },
  }),

  unmuteTag: t.withAuth({ user: true }).field({
    type: Tag,
    args: { input: t.arg({ type: UnmuteTagInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .delete(UserTagMutes)
        .where(and(eq(UserTagMutes.userId, context.session.userId), eq(UserTagMutes.tagId, input.tagId)));

      return input.tagId;
    },
  }),

  followTag: t.withAuth({ user: true }).field({
    type: Tag,
    args: { input: t.arg({ type: FollowTagInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .insert(TagFollows)
        .values({ userId: context.session.userId, tagId: input.tagId })
        .onConflictDoNothing();

      return input.tagId;
    },
  }),

  unfollowTag: t.withAuth({ user: true }).field({
    type: Tag,
    args: { input: t.arg({ type: UnfollowTagInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .delete(TagFollows)
        .where(and(eq(TagFollows.userId, context.session.userId), eq(TagFollows.tagId, input.tagId)));

      return input.tagId;
    },
  }),
}));
