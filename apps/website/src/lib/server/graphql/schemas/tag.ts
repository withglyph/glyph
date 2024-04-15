import { and, desc, eq, notExists } from 'drizzle-orm';
import { PostTagKind } from '$lib/enums';
import { NotFoundError } from '$lib/errors';
import {
  database,
  notInArray,
  Posts,
  PostTags,
  Spaces,
  TagFollows,
  Tags,
  UserSpaceMutes,
  UserTagMutes,
} from '$lib/server/database';
import { getTagUsageCount } from '$lib/server/utils';
import { builder } from '../builder';
import { createObjectRef } from '../utils';
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

export const Tag = createObjectRef('Tag', Tags);
Tag.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    usageCount: t.field({
      type: TagUsageCount,
      resolve: (tag) => getTagUsageCount(tag.id),
    }),

    posts: t.field({
      type: [Post],
      args: { page: t.arg.int({ defaultValue: 1 }), take: t.arg.int({ defaultValue: 10 }) },
      resolve: async (tag, args, context) => {
        return database
          .select({ postId: PostTags.postId })
          .from(PostTags)
          .innerJoin(Posts, eq(PostTags.postId, Posts.id))
          .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
          .where(
            and(
              eq(PostTags.tagId, tag.id),
              eq(Posts.state, 'PUBLISHED'),
              eq(Posts.visibility, 'PUBLIC'),
              eq(Spaces.visibility, 'PUBLIC'),
              context.session
                ? notExists(
                    database
                      .select({ id: PostTags.id })
                      .from(PostTags)
                      .innerJoin(UserTagMutes, eq(UserTagMutes.tagId, PostTags.tagId))
                      .where(and(eq(PostTags.postId, Posts.id), eq(UserTagMutes.userId, context.session.userId))),
                  )
                : undefined,
              context.session
                ? notInArray(
                    Posts.spaceId,
                    database
                      .select({ spaceId: UserSpaceMutes.spaceId })
                      .from(UserSpaceMutes)
                      .where(eq(UserSpaceMutes.userId, context.session.userId)),
                  )
                : undefined,
            ),
          )
          .orderBy(desc(Posts.publishedAt))
          .limit(args.take)
          .offset((args.page - 1) * args.take)
          .then((rows) => rows.map((row) => row.postId));
      },
    }),

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

export const PostTag = createObjectRef('PostTag', PostTags);
PostTag.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    kind: t.expose('kind', { type: PostTagKind }),

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
