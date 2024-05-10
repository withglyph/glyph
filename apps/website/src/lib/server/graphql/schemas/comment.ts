import dayjs from 'dayjs';
import { and, count, desc, eq } from 'drizzle-orm';
import { PostCommentState, PostCommentVisibility } from '$lib/enums';
import { NotFoundError, PermissionDeniedError } from '$lib/errors';
import {
  database,
  inArray,
  PostCommentLikes,
  PostComments,
  PostPurchases,
  Posts,
  SpaceMasquerades,
  UserPersonalIdentities,
} from '$lib/server/database';
import { createNotification, getSpaceMember, Loader, makeMasquerade } from '$lib/server/utils';
import { builder } from '../builder';
import { createObjectRef } from '../utils';
import { Post } from './post';
import { SpaceMasquerade } from './space';
import { Profile } from './user';

/**
 * * Types
 */

export const PostComment = createObjectRef('PostComment', PostComments);
PostComment.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    content: t.string({
      resolve: async (comment, _, context) => {
        if (comment.state === 'INACTIVE') {
          return '';
        }

        if (comment.visibility !== 'PUBLIC') {
          if (!context.session) {
            return '';
          }

          if (context.session.userId !== comment.userId) {
            const postLoader = Loader.postById(context);
            const post = await postLoader.load(comment.postId);

            if (post.userId !== context.session.userId) {
              if (!post.spaceId) {
                return '';
              }

              const member = await getSpaceMember(context, post.spaceId);
              if (!member) {
                return '';
              }
            }
          }
        }

        return comment.content;
      },
    }),
    pinned: t.exposeBoolean('pinned'),
    visibility: t.expose('visibility', { type: PostCommentVisibility }),
    state: t.expose('state', { type: PostCommentState }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),

    post: t.field({
      type: Post,
      nullable: true,
      resolve: async (comment, _, context) => {
        const loader = Loader.postById(context);
        const post = await loader.load(comment.postId);

        if (post.state !== 'PUBLISHED') {
          return null;
        }

        return post;
      },
    }),

    profile: t.field({
      type: Profile,
      resolve: (postComment) => postComment.profileId,
    }),

    masquerade: t.field({
      type: SpaceMasquerade,
      nullable: true,
      resolve: async (postComment, _, context) => {
        const loader = context.loader({
          name: 'PostComment.masquerade[profileId]',
          nullable: true,
          load: async (profileIds: string[]) => {
            return await database
              .select()
              .from(SpaceMasquerades)
              .where(inArray(SpaceMasquerades.profileId, profileIds));
          },
          key: (masquerades) => masquerades?.profileId,
        });

        return await loader.load(postComment.profileId);
      },
    }),

    liked: t.boolean({
      resolve: async (postComment, _, context) => {
        const loader = context.loader({
          name: 'PostComment.liked',
          nullable: true,
          load: async (commentIds: string[]) => {
            if (!context.session) {
              return [];
            }

            return await database
              .select({ id: PostCommentLikes.id, commentId: PostCommentLikes.commentId })
              .from(PostCommentLikes)
              .where(
                and(
                  inArray(PostCommentLikes.commentId, commentIds),
                  eq(PostCommentLikes.userId, context.session.userId),
                ),
              );
          },
          key: (rows) => rows?.commentId,
        });

        const like = await loader.load(postComment.id);
        return !!like;
      },
    }),

    likedByPostUser: t.boolean({
      resolve: async (postComment, _, context) => {
        const loader = context.loader({
          name: 'PostComment.likedByPostUser',
          nullable: true,
          load: async (commentIds: string[]) => {
            return await database
              .select({ commentId: PostCommentLikes.commentId })
              .from(PostCommentLikes)
              .innerJoin(PostComments, eq(PostComments.id, PostCommentLikes.commentId))
              .innerJoin(Posts, eq(Posts.id, PostComments.postId))
              .where(and(inArray(PostCommentLikes.commentId, commentIds), eq(PostCommentLikes.userId, Posts.userId)));
          },
          key: (rows) => rows?.commentId,
        });

        const like = await loader.load(postComment.id);
        return !!like;
      },
    }),

    likeCount: t.int({
      resolve: async (postComment, _, context) => {
        const loader = context.loader({
          name: 'PostComment.likeCount',
          nullable: true,
          load: async (commentIds: string[]) => {
            return await database
              .select({ commentId: PostCommentLikes.commentId, count: count() })
              .from(PostCommentLikes)
              .where(inArray(PostCommentLikes.commentId, commentIds))
              .groupBy(PostCommentLikes.commentId);
          },
          key: (rows) => rows?.commentId,
        });

        const row = await loader.load(postComment.id);

        return row?.count ?? 0;
      },
    }),

    purchased: t.boolean({
      resolve: async (postComment, _, context) => {
        const loader = context.loader({
          name: 'PostComment.purchased',
          nullable: true,
          load: async (commentIds: string[]) => {
            return await database
              .select({ commentId: PostComments.id })
              .from(PostComments)
              .innerJoin(PostPurchases, eq(PostComments.postId, PostPurchases.postId))
              .where(
                and(
                  inArray(PostComments.id, commentIds),
                  eq(PostPurchases.postId, PostComments.postId),
                  eq(PostPurchases.userId, PostComments.userId),
                ),
              );
          },
          key: (rows) => rows?.commentId,
        });

        const row = await loader.load(postComment.id);

        return !!row;
      },
    }),

    parent: t.field({
      type: PostComment,
      nullable: true,
      resolve: (postComment) => postComment.parentId,
    }),

    children: t.field({
      type: [PostComment],
      resolve: async (postComment, _, context) => {
        const loader = context.loader({
          name: 'PostComment.children',
          many: true,
          load: async (parentIds: string[]) => {
            return await database
              .select()
              .from(PostComments)
              .where(and(inArray(PostComments.parentId, parentIds), eq(PostComments.state, 'ACTIVE')))
              .orderBy(desc(PostComments.createdAt));
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          key: (comments) => comments.parentId!,
        });

        return await loader.load(postComment.id);
      },
    }),
  }),
});

/**
 * * Inputs
 */

const CreateCommentInput = builder.inputType('CreateCommentInput', {
  fields: (t) => ({
    content: t.string(),
    parentId: t.id({ required: false }),
    postId: t.id(),
    visibility: t.field({ type: PostCommentVisibility }),
  }),
});

const DeleteCommentInput = builder.inputType('DeleteCommentInput', {
  fields: (t) => ({
    commentId: t.id(),
  }),
});

const UpdateCommentInput = builder.inputType('UpdateCommentInput', {
  fields: (t) => ({
    commentId: t.id(),
    content: t.string(),
  }),
});

const PinCommentInput = builder.inputType('PinCommentInput', {
  fields: (t) => ({
    commentId: t.id(),
  }),
});

const UnpinCommentInput = builder.inputType('UnpinCommentInput', {
  fields: (t) => ({
    commentId: t.id(),
  }),
});

const LikeCommentInput = builder.inputType('LikeCommentInput', {
  fields: (t) => ({
    commentId: t.id(),
  }),
});

const UnlikeCommentInput = builder.inputType('UnlikeCommentInput', {
  fields: (t) => ({
    commentId: t.id(),
  }),
});

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createComment: t.withAuth({ user: true }).field({
    type: PostComment,
    args: { input: t.arg({ type: CreateCommentInput }) },
    resolve: async (_, { input }, context) => {
      const posts = await database
        .select({ userId: Posts.userId, spaceId: Posts.spaceId, commentQualification: Posts.commentQualification })
        .from(Posts)
        .where(and(eq(Posts.id, input.postId), eq(Posts.state, 'PUBLISHED')));

      if (posts.length === 0) {
        throw new NotFoundError();
      }

      const [post] = posts;

      if (post.commentQualification === 'NONE') {
        throw new PermissionDeniedError();
      }

      if (post.commentQualification === 'IDENTIFIED') {
        const rows = await database
          .select({ id: UserPersonalIdentities.id })
          .from(UserPersonalIdentities)
          .where(eq(UserPersonalIdentities.userId, context.session.userId));

        if (rows.length === 0) {
          throw new PermissionDeniedError();
        }
      }

      let notificationTargetUserId;

      if (input.parentId) {
        const rows = await database
          .select()
          .from(PostComments)
          .where(
            and(
              eq(PostComments.id, input.parentId),
              eq(PostComments.postId, input.postId),
              eq(PostComments.state, 'ACTIVE'),
            ),
          );

        if (rows.length === 0) {
          throw new NotFoundError();
        }

        notificationTargetUserId = rows[0].userId;
      } else {
        notificationTargetUserId = post.userId;
      }

      let profileId: string;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const spaceMember = await getSpaceMember(context, post.spaceId!);
      if (spaceMember) {
        profileId = spaceMember.profileId;
      } else {
        const masquerade = await makeMasquerade({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          spaceId: post.spaceId!,
          userId: context.session.userId,
        });

        if (masquerade.blockedAt) {
          throw new PermissionDeniedError();
        }

        profileId = masquerade.profileId;
      }

      return await database.transaction(async (tx) => {
        const [comment] = await tx
          .insert(PostComments)
          .values({
            postId: input.postId,
            userId: context.session.userId,
            profileId,
            parentId: input.parentId,
            content: input.content,
            visibility: input.visibility,
            state: 'ACTIVE',
          })
          .returning({ id: PostComments.id });

        if (notificationTargetUserId !== context.session.userId) {
          await createNotification({
            userId: notificationTargetUserId,
            category: 'COMMENT',
            actorId: profileId,
            data: { commentId: comment.id },
            origin: context.event.url.origin,
          });
        }

        return comment.id;
      });
    },
  }),

  deleteComment: t.withAuth({ user: true }).field({
    type: PostComment,
    args: { input: t.arg({ type: DeleteCommentInput }) },
    resolve: async (_, { input }, context) => {
      const comments = await database
        .select({ userId: PostComments.userId, post: { userId: Posts.userId, spaceId: Posts.spaceId } })
        .from(PostComments)
        .innerJoin(Posts, eq(PostComments.postId, Posts.id))
        .where(and(eq(PostComments.id, input.commentId), eq(PostComments.state, 'ACTIVE')));

      if (comments.length === 0) {
        throw new NotFoundError();
      }

      const [comment] = comments;

      const masquerade = await makeMasquerade({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        spaceId: comment.post.spaceId!,
        userId: context.session.userId,
      });

      if (masquerade.blockedAt) {
        throw new PermissionDeniedError();
      }

      // 댓글을 삭제할 권한이 있나요?
      // 1. 댓글 작성자 자신
      // 2. 포스트 작성자
      if (comment.userId !== context.session.userId && comment.post.userId !== context.session.userId) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const meAsMember = await getSpaceMember(context, comment.post.spaceId!);

        if (meAsMember?.role !== 'ADMIN') {
          throw new PermissionDeniedError();
        }
      }

      await database
        .update(PostComments)
        .set({ state: 'INACTIVE', pinned: false })
        .where(eq(PostComments.id, input.commentId));

      return input.commentId;
    },
  }),

  updateComment: t.withAuth({ user: true }).field({
    type: PostComment,
    args: { input: t.arg({ type: UpdateCommentInput }) },
    resolve: async (_, { input }, context) => {
      const comments = await database
        .select({ userId: PostComments.userId, post: { userId: Posts.userId, spaceId: Posts.spaceId } })
        .from(PostComments)
        .innerJoin(Posts, eq(PostComments.postId, Posts.id))
        .where(
          and(
            eq(PostComments.id, input.commentId),
            eq(PostComments.state, 'ACTIVE'),
            eq(PostComments.userId, context.session.userId),
          ),
        );

      if (comments.length === 0) {
        throw new NotFoundError();
      }

      const [comment] = comments;

      const masquerade = await makeMasquerade({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        spaceId: comment.post.spaceId!,
        userId: context.session.userId,
      });

      if (masquerade.blockedAt) {
        throw new PermissionDeniedError();
      }

      await database
        .update(PostComments)
        .set({
          content: input.content,
          updatedAt: dayjs(),
        })
        .where(eq(PostComments.id, input.commentId));

      return input.commentId;
    },
  }),

  pinComment: t.withAuth({ user: true }).field({
    type: PostComment,
    args: { input: t.arg({ type: PinCommentInput }) },
    resolve: async (_, { input }, context) => {
      const comments = await database
        .select({ post: { id: Posts.id, userId: Posts.userId, spaceId: Posts.spaceId } })
        .from(PostComments)
        .innerJoin(Posts, eq(PostComments.postId, Posts.id))
        .where(and(eq(PostComments.id, input.commentId), eq(PostComments.state, 'ACTIVE')));

      if (comments.length === 0) {
        throw new NotFoundError();
      }

      const [comment] = comments;

      if (comment.post.userId !== context.session.userId) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const meAsMember = await getSpaceMember(context, comment.post.spaceId!);
        if (!meAsMember) {
          throw new PermissionDeniedError();
        }
      }

      // 지금은 댓글 고정 1개만 가능

      await database.transaction(async (tx) => {
        await tx
          .update(PostComments)
          .set({ pinned: false })
          .where(and(eq(PostComments.postId, comment.post.id), eq(PostComments.pinned, true)));

        await tx.update(PostComments).set({ pinned: true }).where(eq(PostComments.id, input.commentId));
      });

      return input.commentId;
    },
  }),

  unpinComment: t.withAuth({ user: true }).field({
    type: PostComment,
    args: { input: t.arg({ type: UnpinCommentInput }) },
    resolve: async (_, { input }, context) => {
      const comments = await database
        .select({ post: { id: Posts.id, userId: Posts.userId, spaceId: Posts.spaceId } })
        .from(PostComments)
        .innerJoin(Posts, eq(PostComments.postId, Posts.id))
        .where(and(eq(PostComments.id, input.commentId), eq(PostComments.state, 'ACTIVE')));

      if (comments.length === 0) {
        throw new NotFoundError();
      }

      const [comment] = comments;

      if (comment.post.userId !== context.session.userId) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const meAsMember = await getSpaceMember(context, comment.post.spaceId!);
        if (!meAsMember) {
          throw new PermissionDeniedError();
        }
      }

      await database.update(PostComments).set({ pinned: false }).where(eq(PostComments.id, input.commentId));

      return input.commentId;
    },
  }),

  likeComment: t.withAuth({ user: true }).field({
    type: PostComment,
    args: { input: t.arg({ type: LikeCommentInput }) },
    resolve: async (_, { input }, context) => {
      const comments = await database
        .select({ post: { id: Posts.id, userId: Posts.userId, spaceId: Posts.spaceId } })
        .from(PostComments)
        .innerJoin(Posts, eq(PostComments.postId, Posts.id))
        .where(and(eq(PostComments.id, input.commentId), eq(PostComments.state, 'ACTIVE')));

      if (comments.length === 0) {
        throw new NotFoundError();
      }

      const [comment] = comments;

      let profileId: string;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const spaceMember = await getSpaceMember(context, comment.post.spaceId!);
      if (spaceMember) {
        profileId = spaceMember.profileId;
      } else {
        const masquerade = await makeMasquerade({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          spaceId: comment.post.spaceId!,
          userId: context.session.userId,
        });

        if (masquerade.blockedAt) {
          throw new PermissionDeniedError();
        }

        profileId = masquerade.profileId;
      }

      await database
        .insert(PostCommentLikes)
        .values({
          commentId: input.commentId,
          userId: context.session.userId,
          profileId,
        })
        .onConflictDoNothing();

      return input.commentId;
    },
  }),

  unlikeComment: t.withAuth({ user: true }).field({
    type: PostComment,
    args: { input: t.arg({ type: UnlikeCommentInput }) },
    resolve: async (_, { input }, context) => {
      await database
        .delete(PostCommentLikes)
        .where(
          and(eq(PostCommentLikes.commentId, input.commentId), eq(PostCommentLikes.userId, context.session.userId)),
        );

      return input.commentId;
    },
  }),
}));
