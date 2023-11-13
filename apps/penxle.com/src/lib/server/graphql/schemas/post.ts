import { init as cuid } from '@paralleldrive/cuid2';
import { ContentFilterCategory, PostRevisionKind, PostVisibility } from '@prisma/client';
import { hash, verify } from 'argon2';
import dayjs from 'dayjs';
import { customAlphabet } from 'nanoid';
import * as R from 'radash';
import { emojiData } from '$lib/emoji';
import { FormValidationError, IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { redis } from '$lib/server/cache';
import { deductUserPoint, getUserPoint } from '$lib/server/utils';
import { revisionContentToText } from '$lib/server/utils/tiptap';
import { createId, createTiptapDocument, createTiptapNode } from '$lib/utils';
import { builder } from '../builder';
import type { JSONContent } from '@tiptap/core';

/**
 * * Types
 */

builder.prismaObject('Post', {
  select: { id: true },
  grantScopes: async ({ id }, { db, ...context }) => {
    if (!context.session) {
      return [];
    }
    const post = await db.post.findUniqueOrThrow({
      select: { userId: true, spaceId: true },
      where: { id },
    });
    if (context.session.userId === post.userId) {
      return ['$post:edit'];
    }
    const member = await db.spaceMember.findUnique({
      select: { role: true },
      where: {
        spaceId_userId: {
          spaceId: post.spaceId,
          userId: context.session.userId,
        },
      },
    });
    if (member?.role === 'ADMIN') {
      return ['$post:edit'];
    }
    return [];
  },
  fields: (t) => ({
    id: t.exposeID('id'),
    permalink: t.exposeString('permalink'),
    shortlink: t.exposeString('shortlink'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    revision: t.prismaField({
      type: 'PostRevision',
      select: (_, __, nestedSelection) => ({
        revisions: nestedSelection({
          where: { kind: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }),
      }),
      resolve: (_, { revisions }) => revisions[0],
    }),

    revisionList: t.relation('revisions', {
      authScopes: { $granted: '$post:edit' },
      query: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    }),

    liked: t.boolean({
      resolve: async (post, _, { db, ...context }) => {
        if (!context.session) {
          return false;
        }

        return await db.postLike.exists({
          where: {
            postId: post.id,
            userId: context.session.userId,
          },
        });
      },
    }),

    member: t.relation('member'),
    space: t.relation('space'),
    option: t.relation('option'),
    likeCount: t.relationCount('likes'),
    viewCount: t.relationCount('views'),

    contentFilters: t.field({
      type: [ContentFilterCategory],
      select: { contentFilters: true },
      resolve: (post) => post.contentFilters.map((filter) => filter.category),
    }),

    blurred: t.boolean({
      select: { contentFilters: true },
      resolve: async (post, _, { db, ...context }) => {
        if (!context.session) {
          return post.contentFilters.length > 0;
        }

        const myFilters = R.objectify(
          await db.userContentFilterPreference.findMany({
            select: { category: true, action: true },
            where: { userId: context.session.userId },
          }),
          (filter) => filter.category,
          (filter) => filter.action,
        );

        return post.contentFilters.some((filter) => myFilters[filter.category] !== 'EXPOSE');
      },
    }),

    reactions: t.prismaField({
      type: ['PostReaction'],
      resolve: async (query, post, _, { db, ...context }) => {
        if (!context.session) {
          return db.postReaction.findMany({
            ...query,
            where: { postId: post.id },
          });
        }
        return [
          ...(await db.postReaction.findMany({
            ...query,
            where: {
              postId: post.id,
              userId: context.session.userId,
            },
            orderBy: { createdAt: 'desc' },
          })),
          ...(await db.postReaction.findMany({
            ...query,
            where: {
              postId: post.id,
              userId: { not: context.session.userId },
            },
            orderBy: { createdAt: 'desc' },
          })),
        ];
      },
    }),

    unlocked: t.boolean({
      select: { option: { select: { password: true } } },
      resolve: async (post, _, context) => {
        if (!post.option.password) {
          return true;
        }

        const unlock = await redis.hget(`Post:${post.id}:passwordUnlock`, context.deviceId);
        return !!unlock && dayjs(unlock).isAfter(dayjs());
      },
    }),

    tags: t.relation('tags'),
  }),
});

builder.prismaObject('PostOption', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    visibility: t.expose('visibility', { type: PostVisibility }),
    discloseStats: t.exposeBoolean('discloseStats'),
    receiveFeedback: t.exposeBoolean('receiveFeedback'),
    receivePatronage: t.exposeBoolean('receivePatronage'),
    receiveTagContribution: t.exposeBoolean('receiveTagContribution'),
    hasPassword: t.boolean({
      select: { password: true },
      resolve: (option) => !!option.password,
    }),
  }),
});

builder.prismaObject('PostRevision', {
  select: { id: true },
  grantScopes: async ({ id }, { db, ...context }) => {
    const post = await db.post.findFirstOrThrow({
      select: {
        id: true,
        spaceId: true,
        userId: true,
        option: { select: { password: true } },
      },
      where: {
        revisions: { some: { id } },
      },
    });

    if (post.option.password) {
      if (!context.session) {
        return [];
      }

      if (context.session.userId === post.userId) {
        return ['$revision:view'];
      }

      const meAsMember = await db.spaceMember.exists({
        where: {
          spaceId: post.spaceId,
          userId: context.session.userId,
          state: 'ACTIVE',
        },
      });

      if (meAsMember) {
        return ['$revision:view'];
      }

      const unlock = await redis.hget(`Post:${post.id}:passwordUnlock`, context.deviceId);

      if (unlock && dayjs(unlock).isAfter(dayjs())) {
        return ['$revision:view'];
      }

      return [];
    }

    return ['$revision:view'];
  },
  fields: (t) => ({
    id: t.exposeID('id'),
    kind: t.expose('kind', { type: PostRevisionKind }),
    title: t.exposeString('title'),
    subtitle: t.exposeString('subtitle', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    content: t.field({
      type: 'JSON',
      authScopes: { $granted: '$revision:view' },
      select: {
        postId: true,
        content: true,
        paidContent: true,
        post: { select: { spaceId: true, option: { select: { price: true } } } },
      },
      resolve: async (revision, _, { db, ...context }) => {
        const content = revision.content as JSONContent[];
        const paidContent = revision.paidContent as JSONContent[] | null;

        if (!paidContent) {
          return createTiptapDocument(content);
        }

        if (context.session) {
          const purchase = await db.postPurchase.findUnique({
            select: { createdAt: true },
            where: {
              postId_userId: {
                postId: revision.postId,
                userId: context.session.userId,
              },
            },
          });

          if (purchase) {
            return createTiptapDocument([
              ...content,
              createTiptapNode({
                type: 'access_barrier',
                attrs: {
                  data: {
                    purchasable: false,

                    price: revision.post.option.price,
                    point: await getUserPoint({ db, userId: context.session.userId }),

                    purchasedAt: dayjs(purchase.createdAt).toISOString(),
                  },
                },
              }),
              ...paidContent,
            ]);
          }

          const isMember = await db.spaceMember.exists({
            where: {
              spaceId: revision.post.spaceId,
              userId: context.session.userId,
            },
          });

          if (isMember) {
            return createTiptapDocument([
              ...content,
              createTiptapNode({
                type: 'access_barrier',
                attrs: { data: { purchasable: false } },
              }),
              ...paidContent,
            ]);
          }
        }

        const paidContentText = await revisionContentToText(
          `${revision.id}:textPaidContent`,
          revision.paidContent as JSONContent[],
        );

        return createTiptapDocument([
          ...content,
          createTiptapNode({
            type: 'access_barrier',
            attrs: {
              data: {
                purchasable: true,

                price: revision.post.option.price,
                point: context.session ? await getUserPoint({ db, userId: context.session.userId }) : null,

                postId: revision.postId,
                revisionId: revision.id,

                counts: {
                  characters: paidContentText.length,
                  images: 42,
                  files: 42,
                },
              },
            },
          }),
        ]);
      },

      unauthorizedResolver: () => createTiptapDocument([]),
    }),

    characterCount: t.field({
      type: 'Int',
      select: { content: true, paidContent: true },
      resolve: async (revision) => {
        const contentText = await revisionContentToText(
          `${revision.id}:textContent`,
          revision.content as JSONContent[],
        );
        const paidContentText = await revisionContentToText(
          `${revision.id}:textPaidContent`,
          revision.paidContent as JSONContent[],
        );
        return contentText.length + paidContentText.length;
      },
    }),

    previewText: t.field({
      type: 'String',
      select: { content: true },
      resolve: async (revision) => {
        const contentText = await revisionContentToText(
          `${revision.id}:textContent`,
          revision.content as JSONContent[],
        );
        return contentText.slice(0, 200);
      },
    }),

    thumbnail: t.relation('thumbnail', { nullable: true }),
  }),
});

builder.prismaObject('PostRevisionThumbnail', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    bounds: t.expose('bounds', { type: 'JSON' }),

    image: t.relation('image'),
  }),
});

builder.prismaObject('PostReaction', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    emoji: t.exposeString('emoji'),

    mine: t.boolean({
      select: { userId: true },
      resolve: async (reaction, _, { ...context }) => {
        if (!context.session) {
          return false;
        }

        return reaction.userId === context.session.userId;
      },
    }),
  }),
});

/**
 * * Inputs
 */

const RevisePostInput = builder.inputType('RevisePostInput', {
  fields: (t) => ({
    revisionKind: t.field({ type: PostRevisionKind }),

    postId: t.id({ required: false }),
    spaceId: t.id(),

    title: t.string(),
    subtitle: t.string({ required: false }),
    content: t.field({ type: 'JSON' }),

    thumbnailId: t.id({ required: false }),
    thumbnailBounds: t.field({ type: 'JSON', required: false }),
    coverImageId: t.id({ required: false }),

    pointAmount: t.int({ required: false }),
  }),
});

const DeletePostInput = builder.inputType('DeletePostInput', {
  fields: (t) => ({
    postId: t.id(),
  }),
});

const UpdatePostOptionsInput = builder.inputType('UpdatePostOptionsInput', {
  fields: (t) => ({
    postId: t.id(),
    visibility: t.field({ type: PostVisibility, required: false }),
    discloseStats: t.boolean({ required: false }),
    receiveFeedback: t.boolean({ required: false }),
    receivePatronage: t.boolean({ required: false }),
    receiveTagContribution: t.boolean({ required: false }),
    contentFilters: t.field({ type: [ContentFilterCategory], required: false }),
    tags: t.stringList({ required: false }),
    password: t.string({ required: false }),
  }),
});

const LikePostInput = builder.inputType('LikePostInput', {
  fields: (t) => ({
    postId: t.id(),
  }),
});

const UnlikePostInput = builder.inputType('UnlikePostInput', {
  fields: (t) => ({
    postId: t.id(),
  }),
});

const PurchasePostInput = builder.inputType('PurchasePostInput', {
  fields: (t) => ({
    postId: t.id(),
    revisionId: t.id(),
  }),
});

const UpdatePostViewInput = builder.inputType('UpdatePostViewInput', {
  fields: (t) => ({
    postId: t.id(),
  }),
});

const CreatePostReactionInput = builder.inputType('CreatePostReactionInput', {
  fields: (t) => ({
    postId: t.id(),
    emoji: t.string(),
  }),
});

const DeletePostReactionInput = builder.inputType('DeletePostReactionInput', {
  fields: (t) => ({
    postId: t.id(),
    emoji: t.string(),
  }),
});

const UnlockPasswordedPostInput = builder.inputType('UnlockPasswordedPostInput', {
  fields: (t) => ({
    postId: t.id(),
    password: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  post: t.prismaField({
    type: 'Post',
    args: { permalink: t.arg.string() },
    resolve: async (query, _, args, { db, ...context }) => {
      const post = await db.post.findUnique({
        include: {
          option: { select: { visibility: true } },
          space: { select: { visibility: true } },
        },
        where: {
          permalink: args.permalink,
          state: 'PUBLISHED',
        },
      });

      if (!post) {
        throw new NotFoundError();
      }

      if (post.space.visibility === 'PRIVATE' || post.option.visibility === 'SPACE') {
        const member = context.session
          ? await db.spaceMember.findUnique({
              select: { id: true },
              where: {
                spaceId_userId: {
                  spaceId: post.spaceId,
                  userId: context.session.userId,
                },
                state: 'ACTIVE',
              },
            })
          : null;

        if (!member) {
          throw new PermissionDeniedError();
        }
      }

      return await db.post.findUniqueOrThrow({
        ...query,
        where: { id: post.id },
      });
    },
  }),

  draftRevision: t.withAuth({ user: true }).prismaField({
    type: 'PostRevision',
    args: { revisionId: t.arg.id() },
    resolve: async (query, _, args, { db, ...context }) =>
      // TODO: 어드민도 접근할 수 있게 권한 체크 추가
      db.postRevision.findUniqueOrThrow({
        ...query,
        where: {
          id: args.revisionId,
          userId: context.session.userId,
        },
      }),
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  revisePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: RevisePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const meAsMember = await db.spaceMember.findUniqueOrThrow({
        select: { id: true, role: true },
        where: {
          spaceId_userId: {
            spaceId: input.spaceId,
            userId: context.session.userId,
          },
        },
      });

      if (input.postId) {
        const post = await db.post.findUniqueOrThrow({
          select: { id: true, userId: true, state: true, spaceId: true },
          where: { id: input.postId },
        });

        if (post.userId !== context.session.userId && (post.spaceId !== input.spaceId || meAsMember.role !== 'ADMIN')) {
          throw new NotFoundError();
        }

        if (post.state === 'PUBLISHED' && post.spaceId !== input.spaceId) {
          throw new IntentionalError('이미 다른 스페이스에 게시된 글이에요.');
        }
      }

      const document = (input.content as JSONContent).content;
      if (!document) {
        throw new FormValidationError('content', '잘못된 내용이에요');
      }

      const accessBarrierPosition = document.findIndex((node) => node.type === 'access_barrier');
      const content = accessBarrierPosition === -1 ? document : document.slice(0, accessBarrierPosition);
      const paidContent = accessBarrierPosition === -1 ? undefined : document.slice(accessBarrierPosition + 1);

      const postId = input.postId ?? createId();

      const revision = {
        userId: context.session.userId,
        kind: input.revisionKind,
        title: input.title,
        subtitle: input.subtitle,
        content,
        paidContent,
        thumbnailId: input.thumbnailId,
        thumbnailBounds: input.thumbnailBounds ?? undefined,
        coverImageId: input.coverImageId,
      };

      const defaultOptions = {
        visibility: 'PUBLIC',
        discloseStats: true,
        receiveFeedback: true,
        receivePatronage: true,
        receiveTagContribution: true,
        pointAmount: input.pointAmount,
      } as const;

      return await db.post.upsert({
        ...query,
        where: { id: postId },
        create: {
          id: postId,
          permalink: customAlphabet('123456789', 12)(),
          shortlink: cuid({ length: 6 })(),
          space: { connect: { id: input.spaceId } },
          member: { connect: { id: meAsMember.id } },
          user: { connect: { id: context.session.userId } },
          kind: 'ARTICLE',
          state: input.revisionKind === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          revisions: { create: { id: createId(), ...revision } },
          option: { create: { id: createId(), ...defaultOptions } },
        },
        update: {
          space: { connect: { id: input.spaceId } },
          member: { connect: { id: meAsMember.id } },
          user: { connect: { id: context.session.userId } },
          revisions: { create: { id: createId(), ...revision } },
          state: input.revisionKind === 'PUBLISHED' ? 'PUBLISHED' : undefined,
        },
      });
    },
  }),

  deletePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: DeletePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: { id: true, userId: true, spaceId: true },
        where: { id: input.postId },
      });

      if (post.userId !== context.session.userId) {
        const meAsMember = await db.spaceMember.findUniqueOrThrow({
          select: { role: true },
          where: {
            spaceId_userId: {
              spaceId: post.spaceId,
              userId: context.session.userId,
            },
          },
        });

        if (meAsMember.role !== 'ADMIN') {
          throw new PermissionDeniedError();
        }
      }

      return await db.post.update({
        ...query,
        where: { id: post.id },
        data: {
          state: 'DELETED',
        },
      });
    },
  }),

  updatePostOptions: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UpdatePostOptionsInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: { id: true, userId: true, spaceId: true },
        where: { id: input.postId },
      });

      if (post.userId !== context.session.userId) {
        const meAsMember = await db.spaceMember.findUniqueOrThrow({
          select: { role: true },
          where: {
            spaceId_userId: {
              spaceId: post.spaceId,
              userId: context.session.userId,
            },
          },
        });

        if (meAsMember.role !== 'ADMIN') {
          throw new PermissionDeniedError();
        }
      }

      if (input.contentFilters) {
        await db.postContentFilter.deleteMany({ where: { postId: post.id } });
      }

      let postTags: { id: string }[] = [];

      if (input.tags) {
        await db.postTag.deleteMany({
          where: {
            postId: post.id,
            pinned: true,
          },
        });

        postTags = await Promise.all(
          input.tags.map(async (tagName) =>
            db.tag.upsert({
              select: { id: true },
              where: { name: tagName },
              create: {
                id: createId(),
                name: tagName,
              },
              update: {},
            }),
          ),
        );
      }

      const password = input.password ? await hash(input.password) : undefined;
      if (password) {
        await redis.del(`Post:${post.id}:passwordUnlock`);
      }

      return await db.post.update({
        ...query,
        where: { id: post.id },
        data: {
          option: {
            update: {
              visibility: input.visibility ?? undefined,
              discloseStats: input.discloseStats ?? undefined,
              receiveFeedback: input.receiveFeedback ?? undefined,
              receivePatronage: input.receivePatronage ?? undefined,
              receiveTagContribution: input.receiveTagContribution ?? undefined,
              password,
            },
          },
          contentFilters: {
            createMany: {
              data:
                input.contentFilters?.map((category) => ({
                  id: createId(),
                  category,
                })) ?? [],
            },
          },
          tags: {
            createMany: {
              data: postTags.map((tag) => ({
                id: createId(),
                tagId: tag.id,
                pinned: true,
                userId: context.session.userId,
              })),
            },
          },
        },
      });
    },
  }),

  likePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: LikePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return db.post.update({
        ...query,
        where: { id: input.postId },
        data: {
          likes: {
            upsert: {
              where: {
                postId_userId: {
                  postId: input.postId,
                  userId: context.session.userId,
                },
              },
              create: {
                id: createId(),
                userId: context.session.userId,
              },
              update: {},
            },
          },
        },
      });
    },
  }),

  unlikePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UnlikePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      return db.post.update({
        ...query,
        where: { id: input.postId },
        data: {
          likes: {
            deleteMany: {
              userId: context.session.userId,
            },
          },
        },
      });
    },
  }),

  purchasePost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: PurchasePostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: {
          id: true,
          userId: true,
          spaceId: true,
          option: { select: { price: true } },
        },
        where: { id: input.postId },
      });

      const isMember = await db.spaceMember.exists({
        where: {
          spaceId: post.spaceId,
          userId: context.session.userId,
        },
      });

      if (isMember || !post.option.price) {
        throw new IntentionalError('구매할 수 없는 포스트에요');
      }

      const purchased = await db.postPurchase.exists({
        where: {
          postId: input.postId,
          userId: context.session.userId,
        },
      });

      if (purchased) {
        throw new IntentionalError('이미 구매한 포스트에요');
      }

      const revision = await db.postRevision.findFirstOrThrow({
        select: { id: true },
        where: {
          postId: post.id,
          kind: 'PUBLISHED',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (revision.id !== input.revisionId) {
        throw new IntentionalError('포스트 내용이 변경되었어요. 다시 시도해 주세요');
      }

      const purchase = await db.postPurchase.create({
        data: {
          id: createId(),
          userId: context.session.userId,
          postId: input.postId,
          revisionId: revision.id,
        },
      });

      await deductUserPoint({
        db,
        userId: context.session.userId,
        amount: post.option.price,
        targetId: purchase.id,
        cause: 'UNLOCK_CONTENT',
      });

      return await db.post.findUniqueOrThrow({
        ...query,
        where: { id: input.postId },
      });
    },
  }),

  updatePostView: t.field({
    type: 'Void',
    nullable: true,
    args: { input: t.arg({ type: UpdatePostViewInput }) },
    resolve: async (_, { input }, { db, ...context }) => {
      const view = await db.postView.findFirst({
        select: { id: true },
        where: {
          postId: input.postId,
          userId: context.session ? context.session.userId : undefined,
          deviceId: context.session ? undefined : context.deviceId,
        },
      });
      if (view) {
        await db.postView.update({
          where: { id: view.id },
          data: {
            deviceId: context.deviceId,
            viewedAt: new Date(),
          },
        });
      } else {
        await db.postView.create({
          data: {
            id: createId(),
            postId: input.postId,
            userId: context.session?.userId,
            deviceId: context.deviceId,
          },
        });
      }
    },
  }),

  createPostReaction: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: CreatePostReactionInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      if (!emojiData.emojis[input.emoji]) {
        throw new IntentionalError('잘못된 이모지에요');
      }
      await db.postReaction.create({
        data: {
          id: createId(),
          userId: context.session.userId,
          postId: input.postId,
          emoji: input.emoji,
        },
      });
      return db.post.findUniqueOrThrow({
        ...query,
        where: { id: input.postId },
      });
    },
  }),

  deletePostReaction: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: DeletePostReactionInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      await db.postReaction.deleteMany({
        where: {
          postId: input.postId,
          userId: context.session.userId,
          emoji: input.emoji,
        },
      });
      return db.post.findUniqueOrThrow({
        ...query,
        where: { id: input.postId },
      });
    },
  }),

  unlockPasswordedPost: t.prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UnlockPasswordedPostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        select: {
          id: true,
          option: {
            select: { password: true },
          },
        },
        where: { id: input.postId },
      });

      if (post.option.password) {
        if (!(await verify(post.option.password, input.password))) {
          throw new FormValidationError('password', '잘못된 비밀번호에요');
        }

        await redis.hset(`Post:${post.id}:passwordUnlock`, context.deviceId, dayjs().add(1, 'hour').toISOString());
        await redis.expire(`Post:${post.id}:passwordUnlock`, 60 * 60);
      }

      return db.post.findUniqueOrThrow({
        ...query,
        where: { id: post.id },
      });
    },
  }),
}));
