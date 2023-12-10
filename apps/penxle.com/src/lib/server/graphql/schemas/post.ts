import { webcrypto } from 'node:crypto';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { init as cuid } from '@paralleldrive/cuid2';
import {
  ContentFilterCategory,
  PostRevisionContentKind,
  PostRevisionKind,
  PostState,
  PostVisibility,
} from '@prisma/client';
import { hash, verify } from 'argon2';
import dayjs from 'dayjs';
import * as R from 'radash';
import { match, P } from 'ts-pattern';
import { emojiData } from '$lib/emoji';
import { FormValidationError, IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { redis } from '$lib/server/cache';
import { s3 } from '$lib/server/external-api/aws';
import { deductUserPoint, directUploadImage, getUserPoint, indexPost, indexTags, isAdulthood } from '$lib/server/utils';
import { decorateContent, revisionContentToText, sanitizeContent } from '$lib/server/utils/tiptap';
import { base36To10, createId, createTiptapDocument, createTiptapNode } from '$lib/utils';
import { defineSchema } from '../builder';
import type { JSONContent } from '@tiptap/core';
import type { ImageBounds } from '$lib/utils';

export const postSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('Post', {
    grantScopes: async (post, { db, ...context }) => {
      // 글 관리 권한이 있는지 체크
      if (context.session?.userId === post.userId) {
        return ['$post:view', '$post:edit'];
      }

      const member = context.session
        ? await db.spaceMember.findUnique({
            where: {
              spaceId_userId: {
                spaceId: post.spaceId,
                userId: context.session.userId,
              },
              state: 'ACTIVE',
            },
          })
        : null;

      if (member?.role === 'ADMIN') {
        return ['$post:view', '$post:edit'];
      }

      // 이 이하부터 글 관리 권한 없음
      // 글을 볼 권한이 없는지 체크

      if (post.state !== 'PUBLISHED' || (post.visibility === 'SPACE' && member?.role !== 'MEMBER')) {
        return [];
      }

      if (post.password) {
        const unlock = await redis.hget(`Post:${post.id}:passwordUnlock`, context.deviceId);
        if (!unlock || dayjs().isAfter(dayjs(unlock))) {
          return [];
        }
      }

      return ['$post:view'];
    },
    fields: (t) => ({
      id: t.exposeID('id'),
      state: t.expose('state', { type: PostState }),

      permalink: t.exposeString('permalink'),
      shortlink: t.field({
        type: 'String',
        resolve: ({ permalink }) => BigInt(permalink).toString(36),
      }),

      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      publishedAt: t.expose('publishedAt', { type: 'DateTime', nullable: true }),

      member: t.relation('member'),
      space: t.relation('space'),
      likeCount: t.relationCount('likes'),
      viewCount: t.relationCount('views'),

      visibility: t.expose('visibility', { type: PostVisibility }),
      discloseStats: t.exposeBoolean('discloseStats'),
      receiveFeedback: t.exposeBoolean('receiveFeedback'),
      receivePatronage: t.exposeBoolean('receivePatronage'),
      receiveTagContribution: t.exposeBoolean('receiveTagContribution'),

      hasPassword: t.boolean({
        resolve: (post) => !!post.password,
      }),

      unlocked: t.boolean({
        resolve: async (post, _, context) => {
          if (!post.password) {
            return true;
          }

          const unlock = await redis.hget(`Post:${post.id}:passwordUnlock`, context.deviceId);
          return !!unlock && dayjs(unlock).isAfter(dayjs());
        },
      }),

      contentFilters: t.expose('contentFilters', { type: [ContentFilterCategory] }),
      blurred: t.boolean({
        resolve: async (post, _, { db, ...context }) => {
          if (!context.session) {
            return post.contentFilters.length > 0;
          }

          const myFilters = R.objectify(
            // await db.userContentFilterPreference.findMany({
            //   where: { userId: context.session.userId },
            // }),
            await db.user
              .findUniqueOrThrow({
                where: { id: context.session.userId },
              })
              .contentFilterPreferences(),
            (filter) => filter.category,
            (filter) => filter.action,
          );

          return post.contentFilters.some((filter) => myFilters[filter] !== 'EXPOSE');
        },
      }),

      publishedRevision: t.relation('publishedRevision', {
        authScopes: { $granted: '$post:view' },
        nullable: true,
        unauthorizedResolver: () => null,
      }),

      revisions: t.relation('revisions', {
        authScopes: { $granted: '$post:edit' },
        query: {
          orderBy: { createdAt: 'desc' },
        },
      }),

      draftRevision: t.prismaField({
        type: 'PostRevision',
        authScopes: { $granted: '$post:edit' },
        args: { revisionId: t.arg.id({ required: false }) },
        select: ({ revisionId }, __, nestedSelection) => ({
          revisions: nestedSelection({
            where: { id: revisionId },
            orderBy: { createdAt: 'desc' },
            take: 1,
          }),
        }),
        resolve: (_, { revisions }) => revisions[0],
      }),

      liked: t.boolean({
        resolve: async (post, _, { db, ...context }) => {
          if (!context.session) {
            return false;
          }

          return await db.postLike.existsUnique({
            where: {
              postId_userId: {
                postId: post.id,
                userId: context.session.userId,
              },
            },
          });
        },
      }),

      reactions: t.prismaField({
        type: ['PostReaction'],
        resolve: async (query, post, _, { db, ...context }) => {
          if (!post.receiveFeedback) {
            return [];
          }

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

      bookmarked: t.boolean({
        deprecationReason: 'Use bookmarkGroups instead',
        select: (_, { ...context }) => {
          if (!context.session) {
            return {};
          }

          return {
            bookmarks: {
              where: {
                bookmarkGroup: { userId: context.session?.userId },
              },
            },
          };
        },

        resolve: (post) => {
          return post.bookmarks?.length > 0;
        },
      }),

      bookmarkGroups: t.prismaField({
        type: ['BookmarkGroup'],
        resolve: (query, post, __, { db, ...context }) => {
          if (!context.session) {
            return [];
          }

          return db.bookmarkGroup.findMany({
            ...query,
            where: {
              userId: context.session.userId,
              posts: {
                some: {
                  postId: post.id,
                },
              },
            },
          });
        },

        unauthorizedResolver: () => [],
      }),

      collection: t.prismaField({
        type: 'SpaceCollection',
        nullable: true,
        select: (_, __, nestedSelection) => ({
          collectionPost: {
            select: {
              collection: nestedSelection(),
            },
          },
        }),

        resolve: (_, { collectionPost }) => {
          if (!collectionPost || collectionPost.collection.state !== 'ACTIVE') {
            return null;
          }

          return collectionPost.collection;
        },
      }),

      purchasedAt: t.field({
        type: 'DateTime',
        nullable: true,
        select: (_, context) => ({
          purchases: context.session
            ? {
                where: {
                  userId: context.session?.userId,
                },
                take: 1,
              }
            : undefined,
        }),

        resolve: ({ purchases }, _, context) => {
          if (!context.session) {
            return null;
          }

          return purchases[0]?.createdAt ?? null;
        },
      }),

      //// deprecated

      purchasedRevision: t.withAuth({ user: true }).prismaField({
        type: 'PostRevision',
        deprecationReason: 'Use PostPurchase.revision instead',
        nullable: true,
        select: (_, context, nestedSelection) => ({
          revisions: nestedSelection({
            where: {
              purchases: {
                some: { userId: context.session.userId },
              },
            },
            take: 1,
          }),
        }),

        resolve: (_, { revisions }) => revisions[0],
      }),
    }),
  });

  builder.prismaObject('PostRevision', {
    grantScopes: async (revision, { db, ...context }) => {
      const post = await db.post.findUniqueOrThrow({
        where: { id: revision.postId },
      });

      if (post.contentFilters.includes('ADULT')) {
        if (!context.session) {
          return [];
        }

        const identity = await db.userPersonalIdentity.findUnique({
          where: { userId: context.session.userId },
        });

        if (!identity || !isAdulthood(identity.birthday)) {
          return [];
        }
      }

      return ['$postRevision:view'];
    },
    fields: (t) => ({
      id: t.exposeID('id'),
      kind: t.expose('kind', { type: PostRevisionKind }),
      title: t.exposeString('title'),
      subtitle: t.exposeString('subtitle', { nullable: true }),
      price: t.exposeInt('price', { nullable: true }),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

      originalThumbnail: t.relation('originalThumbnail', {
        nullable: true,
        authScopes: { $granted: '$postRevision:view' },
        unauthorizedResolver: () => null,
      }),

      croppedThumbnail: t.relation('croppedThumbnail', {
        nullable: true,
        authScopes: { $granted: '$postRevision:view' },
        unauthorizedResolver: () => null,
      }),

      thumbnailBounds: t.expose('thumbnailBounds', {
        type: 'JSON',
        nullable: true,
        authScopes: { $granted: '$postRevision:view' },
        unauthorizedResolver: () => null,
      }),

      tags: t.prismaField({
        type: ['Tag'],
        select: (_, __, nestedSelection) => ({
          tags: {
            include: { tag: nestedSelection() },
          },
        }),

        resolve: (_, { tags }) => tags.map(({ tag }) => tag),
      }),

      contentKind: t.expose('contentKind', { type: PostRevisionContentKind }),

      content: t.field({
        type: 'JSON',
        authScopes: { $granted: '$postRevision:view' },
        select: { post: true, freeContent: true, paidContent: true },
        resolve: async (revision, _, { db, ...context }) => {
          const freeContent = await decorateContent(db, revision.freeContent.data as JSONContent[]);
          const paidContent = revision.paidContent
            ? await decorateContent(db, revision.paidContent.data as JSONContent[])
            : null;

          if (!paidContent) {
            return createTiptapDocument(freeContent);
          }

          if (context.session) {
            const purchase = await db.postPurchase.findUnique({
              where: {
                postId_userId: {
                  postId: revision.post.id,
                  userId: context.session.userId,
                },
              },
            });

            if (purchase) {
              return createTiptapDocument([
                ...freeContent,
                createTiptapNode({
                  type: 'access_barrier',
                  attrs: {
                    price: revision.price,
                    __data: {
                      purchasable: false,
                      purchasedAt: dayjs(purchase.createdAt).toISOString(),
                    },
                  },
                }),
                ...paidContent,
              ]);
            }

            const isMember = await db.spaceMember.existsUnique({
              where: {
                spaceId_userId: {
                  spaceId: revision.post.spaceId,
                  userId: context.session.userId,
                },
              },
            });

            if (isMember) {
              return createTiptapDocument([
                ...freeContent,
                createTiptapNode({
                  type: 'access_barrier',
                  attrs: {
                    price: revision.price,
                    __data: { purchasable: false },
                  },
                }),
                ...paidContent,
              ]);
            }
          }

          const paidContentText = await revisionContentToText(revision.paidContent);

          let paidContentImageCount = 0,
            paidContentFileCount = 0;
          for (const node of paidContent) {
            if (node.type === 'image') {
              paidContentImageCount++;
            } else if (node.type === 'file') {
              paidContentFileCount++;
            }
          }

          return createTiptapDocument([
            ...freeContent,
            createTiptapNode({
              type: 'access_barrier',
              attrs: {
                price: revision.price,
                __data: {
                  purchasable: true,

                  point: context.session ? await getUserPoint({ db, userId: context.session.userId }) : null,

                  postId: revision.post.id,
                  revisionId: revision.id,

                  counts: {
                    characters: paidContentText.length,
                    images: paidContentImageCount,
                    files: paidContentFileCount,
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
        authScopes: { $granted: '$postRevision:view' },
        select: { freeContent: true, paidContent: true },
        resolve: async (revision) => {
          const contentText = await revisionContentToText(revision.freeContent);
          const paidContentText = revision.paidContent ? await revisionContentToText(revision.paidContent) : '';
          return contentText.length + paidContentText.length;
        },

        unauthorizedResolver: () => 0,
      }),

      previewText: t.field({
        type: 'String',
        select: { freeContent: true },
        resolve: async (revision) => {
          const contentText = await revisionContentToText(revision.freeContent);
          return contentText.slice(0, 200).replaceAll(/\s+/g, ' ');
        },

        unauthorizedResolver: () => '',
      }),
    }),
  });

  builder.prismaObject('PostReaction', {
    fields: (t) => ({
      id: t.exposeID('id'),
      emoji: t.exposeString('emoji'),

      mine: t.boolean({
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
      contentKind: t.field({ type: PostRevisionContentKind, defaultValue: 'ARTICLE' }),

      postId: t.id({ required: false }),
      spaceId: t.id(),

      title: t.string(),
      subtitle: t.string({ required: false }),
      content: t.field({ type: 'JSON' }),

      thumbnailId: t.id({ required: false }),
      thumbnailBounds: t.field({ type: 'JSON', required: false }),
      tags: t.stringList({ defaultValue: [] }),
    }),
  });

  const PublishPostInput = builder.inputType('PublishPostInput', {
    fields: (t) => ({
      revisionId: t.id(),
      visibility: t.field({ type: PostVisibility }),
      discloseStats: t.boolean(),
      receiveFeedback: t.boolean(),
      receivePatronage: t.boolean(),
      receiveTagContribution: t.boolean(),
      contentFilters: t.field({ type: [ContentFilterCategory] }),
      password: t.string({ required: false }),
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
    }),
  });

  const DeletePostInput = builder.inputType('DeletePostInput', {
    fields: (t) => ({
      postId: t.id(),
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
          include: { space: true },
          where: {
            permalink: args.permalink,
            state: { not: 'DELETED' },
            space: {
              state: 'ACTIVE',
            },
          },
        });

        if (!post) {
          throw new NotFoundError();
        }

        if (post.space.visibility === 'PRIVATE' || post.state === 'DRAFT' || post.visibility === 'SPACE') {
          const member = context.session
            ? await db.spaceMember.findUnique({
                where: {
                  spaceId_userId: {
                    spaceId: post.space.id,
                    userId: context.session.userId,
                  },
                  state: 'ACTIVE',
                },
              })
            : null;

          if (
            !member ||
            (post.state === 'DRAFT' && member.role !== 'ADMIN' && post.userId !== context.session?.userId)
          ) {
            throw new PermissionDeniedError();
          }
        }

        return await db.post.findUniqueOrThrow({
          ...query,
          where: { id: post.id },
        });
      },
    }),

    // draftRevision: t.withAuth({ user: true }).prismaField({
    //   type: 'PostRevision',
    //   args: { revisionId: t.arg.id() },
    //   resolve: async (query, _, args, { db, ...context }) =>
    //     // TODO: 어드민도 접근할 수 있게 권한 체크 추가
    //     db.postRevision.findUniqueOrThrow({
    //       ...query,
    //       where: {
    //         id: args.revisionId,
    //         userId: context.session.userId,
    //       },
    //     }),
    // }),
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
          where: {
            spaceId_userId: {
              spaceId: input.spaceId,
              userId: context.session.userId,
            },
          },
        });

        if (input.postId) {
          const post = await db.post.findUniqueOrThrow({
            where: { id: input.postId },
          });

          if (
            post.userId !== context.session.userId &&
            (post.spaceId !== input.spaceId || meAsMember.role !== 'ADMIN')
          ) {
            throw new NotFoundError();
          }

          if (post.state === 'PUBLISHED' && post.spaceId !== input.spaceId) {
            throw new IntentionalError('이미 다른 스페이스에 게시된 글이에요.');
          }
        }

        let document = (input.content as JSONContent).content;
        if (!document) {
          throw new FormValidationError('content', '잘못된 내용이에요');
        }

        const lastRevision = input.postId
          ? await db.postRevision.findFirst({
              where: { postId: input.postId },
              orderBy: { createdAt: 'desc' },
            })
          : undefined;

        document = await sanitizeContent(document);

        let croppedImageId: string | undefined;
        if (input.thumbnailId) {
          if (input.thumbnailBounds) {
            const originalImageData = await db.image.findUniqueOrThrow({
              where: {
                id: input.thumbnailId,
                userId: context.session.userId,
              },
            });

            const originalImageRequest = await s3.send(
              new GetObjectCommand({
                Bucket: 'penxle-data',
                Key: originalImageData.path,
              }),
            );

            croppedImageId = await directUploadImage({
              db,
              userId: context.session.userId,
              name: originalImageData.name,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              source: await originalImageRequest.Body!.transformToByteArray(),
              bounds: input.thumbnailBounds as ImageBounds,
            });
          } else {
            croppedImageId = lastRevision?.croppedThumbnailId ?? undefined;
          }
        }

        const accessBarrierPosition = document.findIndex((node) => node.type === 'access_barrier');
        const accessBarrier = accessBarrierPosition === -1 ? undefined : document[accessBarrierPosition];
        const freeContentData = accessBarrierPosition === -1 ? document : document.slice(0, accessBarrierPosition);
        const paidContentData = accessBarrierPosition === -1 ? undefined : document.slice(accessBarrierPosition + 1);
        const freeContentHash = Buffer.from(
          await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(freeContentData))),
        ).toString('hex');
        const paidContentHash = paidContentData
          ? Buffer.from(
              await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(paidContentData))),
            ).toString('hex')
          : undefined;

        const freeContent = await db.postRevisionContent.upsert({
          where: { hash: freeContentHash },
          create: {
            id: createId(),
            hash: freeContentHash,
            data: freeContentData,
          },
          update: {},
        });

        const paidContent = paidContentData
          ? await db.postRevisionContent.upsert({
              where: { hash: paidContentHash },
              create: {
                id: createId(),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                hash: paidContentHash!,
                data: paidContentData,
              },
              update: {},
            })
          : undefined;

        const price: number | undefined = accessBarrier?.attrs?.price;

        const postId = input.postId ?? createId();

        const postTags = await Promise.all(
          (input.tags ?? []).map((tagName) =>
            db.tag.upsert({
              where: { name: tagName },
              create: {
                id: createId(),
                name: tagName,
              },
              update: {},
            }),
          ),
        );

        const revisionData = {
          userId: context.session.userId,
          kind: input.revisionKind,
          contentKind: input.contentKind,
          title: input.title,
          subtitle: input.subtitle?.length ? input.subtitle : undefined,
          freeContentId: freeContent.id,
          paidContentId: paidContent?.id,
          tags: {
            createMany: {
              data: postTags.map((tag) => ({
                id: createId(),
                tagId: tag.id,
              })),
            },
          },
          price,
          originalThumbnailId: input.thumbnailId,
          croppedThumbnailId: croppedImageId,
          thumbnailBounds: input.thumbnailBounds,
        };

        /// 여기까지 데이터 가공 단계
        /// 여기부터 포스트 생성/수정 단계

        // 1. 일단 포스트가 없었다면 생성
        if (!input.postId) {
          await db.post.create({
            data: {
              id: postId,
              permalink: base36To10(cuid({ length: 6 })()),
              spaceId: input.spaceId,
              memberId: meAsMember.id,
              userId: context.session.userId,
              state: 'DRAFT',
              visibility: 'SPACE',
              discloseStats: true,
              receiveFeedback: true,
              receivePatronage: true,
              receiveTagContribution: true,
              contentFilters: [],
            },
          });
        }

        // 2. 리비전 생성/재사용

        let revisionId = createId();

        if (
          lastRevision &&
          lastRevision.kind === 'AUTO_SAVE' &&
          dayjs(lastRevision.createdAt).add(5, 'minutes').isAfter(dayjs())
        ) {
          await db.postRevision.update({
            where: { id: lastRevision.id },
            data: {
              ...revisionData,
              tags: {
                deleteMany: {},
                createMany: revisionData.tags.createMany,
              },
              updatedAt: new Date(),
            },
          });
          revisionId = lastRevision.id;
        } else {
          await db.postRevision.create({
            data: {
              id: revisionId,
              postId,
              ...revisionData,
            },
          });
        }

        /// 여기까지 포스트 생성/수정 단계

        return await db.post.findUniqueOrThrow({
          ...query,
          where: { id: postId },
        });
      },
    }),

    publishPost: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: PublishPostInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const revision = await db.postRevision.update({
          include: { post: true, tags: { include: { tag: true } } },
          where: {
            id: input.revisionId,
            post: {
              state: { not: 'DELETED' },
            },
          },
          data: { kind: 'PUBLISHED' },
        });

        if (revision.userId !== context.session.userId) {
          const meAsMember = await db.spaceMember.findUniqueOrThrow({
            where: {
              spaceId_userId: {
                spaceId: revision.post.id,
                userId: context.session.userId,
              },
              state: 'ACTIVE',
            },
          });

          if (meAsMember.role !== 'ADMIN') {
            throw new PermissionDeniedError();
          }
        }

        if (input.contentFilters.includes('ADULT')) {
          const identity = await db.userPersonalIdentity.findUnique({
            where: { userId: context.session.userId },
          });

          if (!identity || !isAdulthood(identity.birthday)) {
            throw new IntentionalError('성인인증을 하지 않으면 성인 컨텐츠를 게시할 수 없어요');
          }
        }

        const password = await match(input.password)
          .with('', () => revision.post.password)
          .with(P.string, (password) => hash(password))
          .with(P.nullish, () => null)
          .exhaustive();

        await db.postRevision.updateMany({
          where: {
            postId: revision.post.id,
            kind: 'PUBLISHED',
            id: { not: revision.id },
          },
          data: { kind: 'ARCHIVED' },
        });

        const post = await db.post.update({
          ...query,
          where: { id: revision.post.id },
          data: {
            state: 'PUBLISHED',
            publishedAt: revision.post.publishedAt ?? new Date(),
            publishedRevisionId: revision.id,
            visibility: input.visibility,
            discloseStats: input.discloseStats,
            receiveFeedback: input.receiveFeedback,
            receivePatronage: input.receivePatronage,
            receiveTagContribution: input.receiveTagContribution,
            contentFilters: input.contentFilters,
            password,
          },
        });

        await indexPost({ db, postId: revision.post.id });
        await indexTags({ tags: revision.tags.map(({ tag }) => tag) });
        return post;
      },
    }),

    updatePostOptions: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: UpdatePostOptionsInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const post = await db.post.update({
          select: { id: true, password: true },
          where: {
            id: input.postId,
            OR: [
              { userId: context.session.userId },
              { space: { members: { some: { userId: context.session.userId, role: 'ADMIN', state: 'ACTIVE' } } } },
            ],
          },

          data: {
            visibility: input.visibility ?? undefined,
            discloseStats: input.discloseStats ?? undefined,
            receiveFeedback: input.receiveFeedback ?? undefined,
            receivePatronage: input.receivePatronage ?? undefined,
            receiveTagContribution: input.receiveTagContribution ?? undefined,
          },
        });

        if (input.visibility) {
          await indexPost({ db, postId: post.id });
        }

        return db.post.findUniqueOrThrow({
          ...query,
          where: { id: post.id },
        });
      },
    }),

    deletePost: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: DeletePostInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const post = await db.post.findUniqueOrThrow({
          where: { id: input.postId },
        });

        if (post.userId !== context.session.userId) {
          const meAsMember = await db.spaceMember.findUniqueOrThrow({
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
            publishedRevision: { update: { kind: 'ARCHIVED' } },
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
          include: { publishedRevision: true },
          where: { id: input.postId },
        });

        const isMember = await db.spaceMember.existsUnique({
          where: {
            spaceId_userId: {
              spaceId: post.spaceId,
              userId: context.session.userId,
            },
          },
        });

        if (isMember || !post.publishedRevision?.price) {
          throw new IntentionalError('구매할 수 없는 포스트예요');
        }

        const purchased = await db.postPurchase.existsUnique({
          where: {
            postId_userId: {
              postId: input.postId,
              userId: context.session.userId,
            },
          },
        });

        if (purchased) {
          throw new IntentionalError('이미 구매한 포스트예요');
        }

        if (post.publishedRevision.id !== input.revisionId) {
          throw new IntentionalError('포스트 내용이 변경되었어요. 다시 시도해 주세요');
        }

        const purchase = await db.postPurchase.create({
          data: {
            id: createId(),
            userId: context.session.userId,
            postId: input.postId,
            revisionId: post.publishedRevision.id,
          },
        });

        await deductUserPoint({
          db,
          userId: context.session.userId,
          amount: post.publishedRevision.price,
          targetId: purchase.id,
          cause: 'UNLOCK_CONTENT',
        });

        return await db.post.findUniqueOrThrow({
          ...query,
          where: { id: input.postId },
        });
      },
    }),

    updatePostView: t.prismaField({
      type: 'Post',
      args: { input: t.arg({ type: UpdatePostViewInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const view = await db.postView.findFirst({
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

        return db.post.findUniqueOrThrow({
          ...query,
          where: { id: input.postId },
        });
      },
    }),

    createPostReaction: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: CreatePostReactionInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        if (!emojiData.emojis[input.emoji]) {
          throw new IntentionalError('잘못된 이모지예요');
        }

        const post = await db.post.findUniqueOrThrow({
          where: { id: input.postId },
        });

        if (!post.receiveFeedback) {
          throw new IntentionalError('피드백을 받지 않는 포스트예요');
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
          where: { id: input.postId },
        });

        if (post.password) {
          if (!(await verify(post.password, input.password))) {
            throw new FormValidationError('password', '잘못된 비밀번호예요');
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
});
