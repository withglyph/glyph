import { NotFoundError, PermissionDeniedError } from '$lib/errors';
import { Loader, makeMasquerade } from '$lib/server/utils';
import { createId } from '$lib/utils';
import { PrismaEnums } from '$prisma';
import { defineSchema } from '../builder';

export const commentSchema = defineSchema((builder) => {
  builder.prismaObject('PostComment', {
    grantScopes: async (comment, { db, ...context }) => {
      if (comment.state === 'INACTIVE') return [];
      if (comment.visibility === 'PUBLIC') return ['$comment:viewContent'];
      if (!context.session) return [];
      if (comment.userId === context.session.userId) return ['$comment:viewContent'];

      const postLoader = Loader.post({ db, context });
      const post = await postLoader.load(comment.postId);

      if (post?.userId === context.session.userId) return ['$comment:viewContent'];
      if (!post) return [];

      const memberLoader = Loader.spaceMember({ db, context });
      const member = await memberLoader.load(post.spaceId);

      if (member?.role === 'ADMIN') return ['$comment:viewContent'];
      return [];
    },
    fields: (t) => ({
      id: t.exposeID('id'),
      profile: t.relation('profile'),
      masquerade: t.prismaField({
        type: 'SpaceMasquerade',
        nullable: true,
        select: (_, __, nestedSelection) => ({
          profile: {
            select: { spaceMasquerade: nestedSelection() },
          },
        }),
        resolve: (_, { profile }) => profile.spaceMasquerade,
      }),

      parent: t.relation('parent', { nullable: true }),
      state: t.expose('state', { type: PrismaEnums.PostCommentState }),
      content: t.exposeString('content', {
        authScopes: { $granted: '$comment:viewContent' },
        unauthorizedResolver: () => '',
      }),
      pinned: t.exposeBoolean('pinned'),
      childComments: t.relation('childComments', {
        query: {
          where: { state: 'ACTIVE' },
        },
      }),

      visibility: t.expose('visibility', { type: PrismaEnums.PostCommentVisibility }),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    }),
  });

  const CreateCommentInput = builder.inputType('CreateCommentInput', {
    fields: (t) => ({
      content: t.string(),
      parentId: t.id({ required: false }),
      postId: t.id(),
      visibility: t.field({ type: PrismaEnums.PostCommentVisibility }),
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

  builder.mutationFields((t) => ({
    createComment: t.withAuth({ user: true }).prismaField({
      type: 'PostComment',
      args: { input: t.arg({ type: CreateCommentInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const post = await db.post.findUniqueOrThrow({
          where: {
            id: input.postId,
            state: 'PUBLISHED',
          },
        });

        if (!post.spaceId) {
          throw new NotFoundError();
        }

        const profileId = await (async () => {
          const meAsMember = await db.spaceMember.findUnique({
            where: {
              spaceId_userId: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                spaceId: post.spaceId!,
                userId: context.session.userId,
              },
              state: 'ACTIVE',
            },
          });

          if (meAsMember) {
            return meAsMember.profileId;
          }

          if (post.commentQualification === 'NONE') {
            throw new PermissionDeniedError();
          }

          if (post.commentQualification === 'IDENTIFIED') {
            const user = await db.userPersonalIdentity.existsUnique({
              where: { userId: context.session.userId },
            });

            if (!user) {
              throw new PermissionDeniedError();
            }
          }

          const masquerade = await makeMasquerade({
            db,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            spaceId: post.spaceId!,
            userId: context.session.userId,
          });

          if (masquerade.blockedAt) {
            throw new PermissionDeniedError();
          }

          return masquerade.profileId;
        })();

        let parentId: string | null = input.parentId ?? null;
        if (parentId) {
          const parentComment = await db.postComment.findUnique({
            where: {
              id: parentId,
              postId: input.postId,
              state: 'ACTIVE',
            },
          });

          if (!parentComment) {
            throw new NotFoundError();
          }

          if (parentComment.parentId) {
            parentId = parentComment.parentId;
          }
        }

        return db.postComment.create({
          ...query,
          data: {
            id: createId(),
            postId: input.postId,
            userId: context.session.userId,
            profileId,
            parentId,
            state: 'ACTIVE',
            content: input.content,
            visibility: input.visibility,
          },
        });
      },
    }),

    deleteComment: t.withAuth({ user: true }).prismaField({
      type: 'PostComment',
      args: { input: t.arg({ type: DeleteCommentInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const comment = await db.postComment.findUniqueOrThrow({
          where: { id: input.commentId },
          include: {
            post: true,
          },
        });

        const masquerade = await makeMasquerade({
          db,
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
          // 3. 스페이스 소속 관리자
          const meAsMember = comment.post.spaceId
            ? await db.spaceMember.findUnique({
                where: {
                  spaceId_userId: {
                    spaceId: comment.post.spaceId,
                    userId: context.session.userId,
                  },
                  state: 'ACTIVE',
                  role: 'ADMIN',
                },
              })
            : null;

          if (!meAsMember) {
            throw new PermissionDeniedError();
          }
        }

        return db.postComment.update({
          ...query,
          where: { id: comment.id },
          data: {
            state: 'INACTIVE',
            pinned: false,
          },
        });
      },
    }),

    updateComment: t.withAuth({ user: true }).prismaField({
      type: 'PostComment',
      args: { input: t.arg({ type: UpdateCommentInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const comment = await db.postComment.findUniqueOrThrow({
          where: {
            id: input.commentId,
            state: 'ACTIVE',
            userId: context.session.userId,
          },
          include: {
            post: true,
          },
        });

        const masquerade = await makeMasquerade({
          db,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          spaceId: comment.post.spaceId!,
          userId: context.session.userId,
        });

        if (masquerade.blockedAt) {
          throw new PermissionDeniedError();
        }

        return await db.postComment.update({
          ...query,
          where: { id: comment.id },
          data: {
            content: input.content,
            updatedAt: new Date(),
          },
        });
      },
    }),
  }));
});
