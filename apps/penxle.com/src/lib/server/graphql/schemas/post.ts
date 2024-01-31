import { init as cuid } from '@paralleldrive/cuid2';
import { hash, verify } from 'argon2';
import dayjs from 'dayjs';
import * as R from 'radash';
import { match, P } from 'ts-pattern';
import { emojiData } from '$lib/emoji';
import { FormValidationError, IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { redis, useCache } from '$lib/server/cache';
import { elasticSearch, indexName } from '$lib/server/search';
import {
  createNotification,
  createRevenue,
  deductUserPoint,
  getMutedSpaceIds,
  getMutedTagIds,
  getUserPoint,
  indexPost,
  isAdulthood,
  isGte15,
  Loader,
  makeMasquerade,
  makeQueryContainers,
  revisePostContent,
  searchResultToPrismaData,
} from '$lib/server/utils';
import { decorateContent, revisionContentToText, sanitizeContent } from '$lib/server/utils/tiptap';
import { base36To10, createId, createTiptapDocument, createTiptapNode, validateTiptapDocument } from '$lib/utils';
import { PublishPostInputSchema, RevisePostInputSchema } from '$lib/validations/post';
import { PrismaEnums } from '$prisma';
import { defineSchema } from '../builder';
import type { JSONContent } from '@tiptap/core';

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

      const spaceMemberLoader = Loader.spaceMember({ db, context });
      const member = await spaceMemberLoader.load(post.spaceId);

      if (member?.role === 'ADMIN') {
        return ['$post:view', '$post:edit'];
      }

      // 이 이하부터 글 관리 권한 없음
      // 글을 볼 권한이 없는지 체크

      if (post.state !== 'PUBLISHED' || (post.visibility === 'SPACE' && member?.role !== 'MEMBER')) {
        const purchase = context.session
          ? await db.postPurchase.exists({
              where: {
                postId: post.id,
                userId: context.session.userId,
              },
            })
          : false;

        if (!purchase) {
          return [];
        }
      }

      return ['$post:view'];
    },
    fields: (t) => ({
      id: t.exposeID('id'),
      state: t.expose('state', { type: PrismaEnums.PostState }),

      permalink: t.exposeString('permalink'),
      shortlink: t.field({
        type: 'String',
        resolve: ({ permalink }) => BigInt(permalink).toString(36),
      }),

      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      publishedAt: t.expose('publishedAt', { type: 'DateTime', nullable: true }),

      member: t.relation('member', { nullable: true }),
      space: t.relation('space', { nullable: true }),
      likeCount: t.relationCount('likes'),

      viewCount: t.int({
        resolve: (post, _, { db }) =>
          useCache(`Post:${post.id}:viewCount`, () => db.postView.count({ where: { postId: post.id } }), 600),
      }),

      visibility: t.expose('visibility', { type: PrismaEnums.PostVisibility }),
      ageRating: t.expose('ageRating', { type: PrismaEnums.PostAgeRating }),
      externalSearchable: t.exposeBoolean('externalSearchable'),
      category: t.expose('category', { type: PrismaEnums.PostCategory }),
      pairs: t.expose('pairs', { type: [PrismaEnums.PostPair] }),
      discloseStats: t.exposeBoolean('discloseStats'),
      receiveFeedback: t.exposeBoolean('receiveFeedback'),
      receivePatronage: t.exposeBoolean('receivePatronage'),
      receiveTagContribution: t.exposeBoolean('receiveTagContribution'),
      protectContent: t.exposeBoolean('protectContent'),

      thumbnail: t.relation('thumbnail', {
        authScopes: { $granted: '$post:view' },
        nullable: true,
        unauthorizedResolver: () => null,
      }),

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

      contentFilters: t.expose('contentFilters', { type: [PrismaEnums.ContentFilterCategory] }),
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
        grantScopes: ['$postRevision:edit'],
        query: {
          orderBy: { createdAt: 'desc' },
        },
      }),

      draftRevision: t.prismaField({
        type: 'PostRevision',
        authScopes: { $granted: '$post:edit' },
        grantScopes: ['$postRevision:edit'],
        nullable: true,
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
            where: { collection: { state: 'ACTIVE' } },
            select: { collection: nestedSelection() },
          },
        }),

        resolve: (_, { collectionPost }) => {
          return collectionPost ? collectionPost.collection : null;
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

      tags: t.prismaField({
        type: ['Tag'],
        select: (_, __, nestedSelection) => ({
          tags: {
            include: { tag: nestedSelection() },
          },
        }),

        resolve: (_, { tags }) => tags.map(({ tag }) => tag),
      }),

      previousPost: t.prismaField({
        type: 'Post',
        nullable: true,
        resolve: async (query, post, _, { db, ...context }) => {
          if (!post.publishedAt) {
            return null;
          }

          const spaceMemberLoader = Loader.spaceMember({ db, context });
          const meAsMember = await spaceMemberLoader.load(post.spaceId);

          return db.post.findFirst({
            ...query,
            where: {
              spaceId: post.spaceId,
              state: 'PUBLISHED',
              publishedAt: { lt: post.publishedAt },
              visibility: meAsMember ? undefined : 'PUBLIC',
            },
            orderBy: { publishedAt: 'desc' },
          });
        },
      }),

      nextPost: t.prismaField({
        type: 'Post',
        nullable: true,
        resolve: async (query, post, _, { db, ...context }) => {
          if (!post.publishedAt) {
            return null;
          }

          const spaceMemberLoader = Loader.spaceMember({ db, context });
          const meAsMember = await spaceMemberLoader.load(post.spaceId);

          return await db.post.findFirst({
            ...query,
            where: {
              spaceId: post.spaceId,
              state: 'PUBLISHED',
              publishedAt: { gt: post.publishedAt },
              visibility: meAsMember ? undefined : 'PUBLIC',
            },
            orderBy: { publishedAt: 'asc' },
          });
        },
      }),

      recommendedPosts: t.prismaField({
        type: ['Post'],
        select: { publishedRevision: true },
        resolve: async (query, post, _, { db, ...context }) => {
          if (!post.publishedRevision) {
            return [];
          }

          const [postTagIds, mutedTagIds, mutedSpaceIds, recentlyViewedPostIds] = await Promise.all([
            db.postTag
              .findMany({
                where: { postId: post.id },
              })
              .then((tags) => tags.map(({ tagId }) => tagId)),
            getMutedTagIds({ db, userId: context.session?.userId }),
            getMutedSpaceIds({ db, userId: context.session?.userId }),
            context.session
              ? db.postView
                  .findMany({
                    where: { userId: context.session?.userId },
                    orderBy: { viewedAt: 'desc' },
                    take: 100,
                  })
                  .then((views) => [...views.map(({ postId }) => postId), post.id])
              : [post.id],
          ]);

          const searchResult = await elasticSearch.search({
            index: indexName('posts'),
            query: {
              bool: {
                should: [{ terms: { 'tags.id': postTagIds } }, { term: { ['spaceId']: post.spaceId } }],
                must_not: makeQueryContainers([
                  {
                    query: {
                      terms: { ['tags.id']: mutedTagIds },
                    },
                    condition: mutedTagIds.length > 0,
                  },
                  {
                    query: {
                      terms: { spaceId: mutedSpaceIds },
                    },
                    condition: mutedSpaceIds.length > 0,
                  },
                  {
                    query: {
                      ids: { values: recentlyViewedPostIds },
                    },
                  },
                ]),
              },
            },

            size: 10,
          });

          return searchResultToPrismaData({
            searchResult,
            db,
            tableName: 'post',
            queryArgs: {
              ...query,
              where: {
                state: 'PUBLISHED',
                space: {
                  state: 'ACTIVE',
                  visibility: 'PUBLIC',
                },
              },
            },
          });
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
      const postLoader = Loader.post({ db, context });
      const post = await postLoader.load(revision.postId);

      if (!post) {
        return [];
      }

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

      if (post.password && post.userId !== context.session?.userId) {
        const unlock = await redis.hget(`Post:${post.id}:passwordUnlock`, context.deviceId);
        if (!unlock || dayjs().isAfter(dayjs(unlock))) {
          return [];
        }
      }

      return ['$postRevision:view'];
    },
    fields: (t) => ({
      id: t.exposeID('id'),
      kind: t.expose('kind', { type: PrismaEnums.PostRevisionKind }),
      title: t.exposeString('title'),
      subtitle: t.exposeString('subtitle', { nullable: true }),
      price: t.exposeInt('price', { nullable: true }),
      autoIndent: t.exposeBoolean('autoIndent'),
      paragraphIndent: t.exposeInt('paragraphIndent'),
      paragraphSpacing: t.exposeInt('paragraphSpacing'),

      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

      originalThumbnail: t.relation('originalThumbnail', {
        nullable: true,
        deprecationReason: 'Use Post.thumbnail instead',
        authScopes: { $granted: '$postRevision:view' },
        unauthorizedResolver: () => null,
      }),

      croppedThumbnail: t.relation('croppedThumbnail', {
        nullable: true,
        deprecationReason: 'Use Post.thumbnail instead',
        authScopes: { $granted: '$postRevision:view' },
        unauthorizedResolver: () => null,
      }),

      thumbnailBounds: t.expose('thumbnailBounds', {
        type: 'JSON',
        deprecationReason: 'Deleted',
        nullable: true,
        authScopes: { $granted: '$postRevision:view' },
        unauthorizedResolver: () => null,
      }),

      tags: t.prismaField({
        type: ['Tag'],
        deprecationReason: 'Use Post.tags instead',
        select: (_, __, nestedSelection) => ({
          tags: {
            include: { tag: nestedSelection() },
          },
        }),

        resolve: (_, { tags }) => tags.map(({ tag }) => tag),
      }),

      contentKind: t.expose('contentKind', { type: PrismaEnums.PostRevisionContentKind }),

      editableContent: t.field({
        type: 'JSON',
        authScopes: { $granted: '$postRevision:edit' },
        select: { freeContent: true, paidContent: true },
        resolve: async (revision, _, { db }) => {
          const freeContent = await decorateContent(db, revision.freeContent.data as JSONContent[]);
          const paidContent = revision.paidContent
            ? await decorateContent(db, revision.paidContent.data as JSONContent[])
            : null;

          return createTiptapDocument([
            ...freeContent,
            createTiptapNode({ type: 'access_barrier' }),
            ...(paidContent ?? []),
          ]);
        },
      }),

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

          // 유료분이 있음 - 유료분을 볼 수 있는 경우는?

          if (context.session) {
            if (context.session.userId === revision.post.userId) {
              // 1. 글 작성자 자신
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

            if (revision.post.spaceId) {
              const purchase = await db.postPurchase.findUnique({
                where: {
                  postId_userId: {
                    postId: revision.post.id,
                    userId: context.session.userId,
                  },
                },
              });

              if (purchase) {
                // 2. 구매한 경우
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
                // 3. 해당 스페이스의 멤버인 경우
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
        authScopes: { $granted: '$postRevision:view' },
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

  const TagInput = builder.inputType('TagInput', {
    fields: (t) => ({
      name: t.string(),
      kind: t.field({ type: PrismaEnums.PostTagKind }),
    }),
  });

  const RevisePostInput = builder.inputType('RevisePostInput', {
    fields: (t) => ({
      revisionKind: t.field({ type: PrismaEnums.PostRevisionKind }),
      contentKind: t.field({ type: PrismaEnums.PostRevisionContentKind, defaultValue: 'ARTICLE' }),

      postId: t.id(),

      title: t.string(),
      subtitle: t.string({ required: false }),
      content: t.field({ type: 'JSON' }),

      paragraphIndent: t.int(),
      paragraphSpacing: t.int(),
    }),
    validate: { schema: RevisePostInputSchema },
  });

  const PublishPostInput = builder.inputType('PublishPostInput', {
    fields: (t) => ({
      revisionId: t.id(),
      spaceId: t.id(),
      collectionId: t.id({ required: false }),
      thumbnailId: t.id({ required: false }),
      visibility: t.field({ type: PrismaEnums.PostVisibility }),
      password: t.string({ required: false }),
      ageRating: t.field({ type: PrismaEnums.PostAgeRating, defaultValue: 'ALL' }),
      externalSearchable: t.boolean({ defaultValue: true }),
      discloseStats: t.boolean(),
      receiveFeedback: t.boolean(),
      receivePatronage: t.boolean(),
      receiveTagContribution: t.boolean(),
      protectContent: t.boolean({ required: false, defaultValue: true }),
      category: t.field({ type: PrismaEnums.PostCategory }),
      pairs: t.field({ type: [PrismaEnums.PostPair], defaultValue: [] }),
      tags: t.field({ type: [TagInput], defaultValue: [] }),
    }),
    validate: { schema: PublishPostInputSchema },
  });

  const UpdatePostOptionsInput = builder.inputType('UpdatePostOptionsInput', {
    fields: (t) => ({
      postId: t.id(),
      visibility: t.field({ type: PrismaEnums.PostVisibility, required: false }),
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
            space: {
              state: 'ACTIVE',
            },
          },
        });

        if (!post) {
          throw new NotFoundError();
        }

        if (
          post.space?.visibility === 'PRIVATE' ||
          post.state === 'DRAFT' ||
          post.visibility === 'SPACE' ||
          post.state === 'DELETED'
        ) {
          if (!context.session) {
            throw new PermissionDeniedError();
          }

          const member = post.space
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
            const purchase = await db.postPurchase.exists({
              where: {
                postId: post.id,
                userId: context.session.userId,
              },
            });

            if (!purchase) {
              throw new PermissionDeniedError();
            }
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
    createPost: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      resolve: async (query, _, __, { db, ...context }) => {
        let permalink: string;

        for (;;) {
          permalink = base36To10(cuid({ length: 6 })());
          const exists = await db.post.exists({ where: { permalink } });
          if (!exists) {
            break;
          }
        }

        const emptyContent = await revisePostContent({ db, contentData: [createTiptapNode({ type: 'paragraph' })] });

        return await db.post.create({
          ...query,
          data: {
            id: createId(),
            permalink,
            userId: context.session.userId,
            state: 'DRAFT',
            visibility: 'PUBLIC',
            discloseStats: true,
            receiveFeedback: true,
            receivePatronage: true,
            receiveTagContribution: true,
            protectContent: true,
            contentFilters: [],
            revisions: {
              create: {
                id: createId(),
                userId: context.session.userId,
                kind: 'AUTO_SAVE',
                freeContentId: emptyContent.id,
                contentKind: 'ARTICLE',
                title: '',
              },
            },
          },
        });
      },
    }),

    revisePost: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: RevisePostInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const post = await db.post.findUniqueOrThrow({
          where: { id: input.postId },
        });

        if (post.userId !== context.session.userId) {
          if (!post.spaceId) {
            throw new NotFoundError();
          }

          const meAsMember = await db.spaceMember.findUniqueOrThrow({
            where: {
              spaceId_userId: {
                spaceId: post.spaceId,
                userId: context.session.userId,
              },
            },
          });

          if (meAsMember.role !== 'ADMIN') {
            throw new NotFoundError();
          }
        }

        let document = (input.content as JSONContent).content;

        if (!document || !validateTiptapDocument(input.content)) {
          throw new FormValidationError('content', '잘못된 내용이에요');
        }

        const lastRevision = input.postId
          ? await db.postRevision.findFirst({
              where: { postId: input.postId },
              orderBy: { createdAt: 'desc' },
            })
          : undefined;

        document = await sanitizeContent(document);

        const accessBarrierPosition = document.findIndex((node) => node.type === 'access_barrier');
        const accessBarrier =
          accessBarrierPosition === -1 || accessBarrierPosition === document.length - 1
            ? undefined
            : document[accessBarrierPosition];
        const freeContentData = accessBarrierPosition === -1 ? document : document.slice(0, accessBarrierPosition);
        const paidContentData =
          accessBarrierPosition === -1 || accessBarrierPosition === document.length - 1
            ? undefined
            : document.slice(accessBarrierPosition + 1);

        const freeContent = await revisePostContent({ db, contentData: freeContentData });
        const paidContent = paidContentData ? await revisePostContent({ db, contentData: paidContentData }) : null;
        const price: number | null = accessBarrier?.attrs?.price ?? null;

        const revisionData = {
          userId: context.session.userId,
          kind: input.revisionKind,
          contentKind: input.contentKind,
          title: input.title,
          subtitle: input.subtitle?.length ? input.subtitle : undefined,
          freeContentId: freeContent.id,
          paidContentId: paidContent?.id ?? null,
          price,
          paragraphIndent: input.paragraphIndent,
          paragraphSpacing: input.paragraphSpacing,
        };

        /// 여기까지 데이터 가공 단계
        /// 여기부터 포스트 수정 단계

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
              updatedAt: new Date(),
            },
          });
          revisionId = lastRevision.id;

          // dangling PostContent 삭제
          await db.postRevisionContent.deleteMany({
            where: {
              id: lastRevision.freeContentId,
              revisionsUsingThisAsFreeContent: { none: {} },
              revisionsUsingThisAsPaidContent: { none: {} },
            },
          });

          if (lastRevision.paidContentId) {
            await db.postRevisionContent.deleteMany({
              where: {
                id: lastRevision.paidContentId,
                revisionsUsingThisAsFreeContent: { none: {} },
                revisionsUsingThisAsPaidContent: { none: {} },
              },
            });
          }
        } else {
          await db.postRevision.create({
            data: {
              id: revisionId,
              postId: input.postId,
              ...revisionData,
            },
          });
        }

        /// 여기까지 포스트 생성/수정 단계

        return await db.post.findUniqueOrThrow({
          ...query,
          where: { id: input.postId },
        });
      },
    }),

    publishPost: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: PublishPostInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const revision = await db.postRevision.update({
          include: { post: true, tags: { include: { tag: true } }, freeContent: true, paidContent: true },
          where: {
            id: input.revisionId,
            post: {
              state: { not: 'DELETED' },
            },
          },
          data: { kind: 'PUBLISHED' },
        });

        if (revision.post.spaceId && revision.post.spaceId !== input.spaceId) {
          throw new IntentionalError('발행된 포스트의 스페이스를 변경할 수 없어요');
        }

        const meAsMember = await db.spaceMember.findUnique({
          where: {
            spaceId_userId: {
              spaceId: input.spaceId,
              userId: context.session.userId,
            },
            state: 'ACTIVE',
          },
        });

        if (!meAsMember || (revision.userId !== context.session.userId && meAsMember.role !== 'ADMIN')) {
          throw new PermissionDeniedError();
        }

        if (input.ageRating !== 'ALL') {
          const identity = await db.userPersonalIdentity.findUnique({
            where: { userId: context.session.userId },
          });

          if (
            !identity ||
            (input.ageRating === 'R19' && !isAdulthood(identity.birthday)) ||
            (input.ageRating === 'R15' && !isGte15(identity.birthday))
          ) {
            throw new IntentionalError('본인인증을 하지 않으면 연령 제한 컨텐츠를 게시할 수 없어요');
          }
        }

        if (revision.price !== null) {
          if (revision.price <= 0 || revision.price > 1_000_000 || revision.price % 100 !== 0) {
            throw new IntentionalError('잘못된 가격이에요');
          }
          if (
            revision.contentKind === 'GALLERY' &&
            ((revision.freeContent.data as JSONContent[]).length === 0 ||
              ((revision.paidContent?.data as JSONContent[])?.length ?? 0) === 0)
          ) {
            throw new IntentionalError('결제 상자 위치가 잘못되었어요');
          }
        }

        const password = await match(input.password)
          .with('', () => revision.post.password)
          .with(P.string, (password) => hash(password))
          .with(P.nullish, () => null)
          .exhaustive();

        if (input.password) {
          await redis.del(`Post:${revision.post.id}:passwordUnlock`);
        }

        const postTags = await Promise.all(
          (input.tags ?? []).map((tag) =>
            db.tag.upsert({
              where: { name: tag.name },
              create: {
                id: createId(),
                name: tag.name,
              },
              update: {},
            }),
          ),
        );

        await db.postRevision.updateMany({
          where: {
            postId: revision.post.id,
            kind: 'PUBLISHED',
            id: { not: revision.id },
          },
          data: { kind: 'ARCHIVED' },
        });

        const post = await db.post.update({
          include: {
            publishedRevision: {
              include: {
                tags: { include: { tag: true } },
              },
            },
            space: true,
            collectionPost: true,
          },
          where: { id: revision.post.id },
          data: {
            spaceId: input.spaceId,
            memberId: meAsMember.id,
            state: 'PUBLISHED',
            publishedAt: revision.post.publishedAt ?? new Date(),
            publishedRevisionId: revision.id,
            visibility: input.visibility,
            ageRating: input.ageRating,
            thumbnailId: input.thumbnailId ?? null,
            externalSearchable: input.externalSearchable,
            discloseStats: input.discloseStats,
            receiveFeedback: input.receiveFeedback,
            receivePatronage: input.receivePatronage,
            receiveTagContribution: input.receiveTagContribution,
            // TODO: required 만들기
            protectContent: input.protectContent ?? true,
            password,
            category: input.category,
            pairs: input.pairs,
            tags: {
              deleteMany: {},
              createMany: {
                data: input.tags.map(({ name, kind }) => ({
                  id: createId(),
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  tagId: postTags.find((tag) => tag.name === name)!.id,
                  kind,
                })),
              },
            },
          },
        });

        if (input.collectionId && post.collectionPost?.collectionId !== input.collectionId) {
          if (post.collectionPost) {
            await db.spaceCollectionPost.delete({
              where: {
                postId: post.id,
              },
            });
          }

          const targetCollectionAggregation = await db.spaceCollectionPost.aggregate({
            where: {
              collectionId: input.collectionId,
            },
            _max: {
              order: true,
            },
          });

          const order = targetCollectionAggregation._max.order ?? -1;

          await db.spaceCollectionPost.create({
            data: {
              id: createId(),
              postId: post.id,
              collectionId: input.collectionId,
              order: order + 1,
            },
          });
        } else {
          await db.spaceCollectionPost.deleteMany({
            where: {
              postId: post.id,
            },
          });
        }

        await indexPost(post);
        return db.post.findUniqueOrThrow({
          ...query,
          where: { id: post.id },
        });
      },
    }),

    updatePostOptions: t.withAuth({ user: true }).prismaField({
      type: 'Post',
      args: { input: t.arg({ type: UpdatePostOptionsInput }) },
      resolve: async (query, _, { input }, { db, ...context }) => {
        const post = await db.post.update({
          include: {
            publishedRevision: {
              include: {
                tags: { include: { tag: true } },
              },
            },
            space: true,
          },
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

        await indexPost(post);

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
          const meAsMember = post.spaceId
            ? await db.spaceMember.findUnique({
                where: {
                  spaceId_userId: {
                    spaceId: post.spaceId,
                    userId: context.session.userId,
                  },
                },
              })
            : null;

          if (meAsMember?.role !== 'ADMIN') {
            throw new PermissionDeniedError();
          }
        }

        await db.spaceCollectionPost.deleteMany({
          where: { postId: post.id },
        });

        return await db.post.update({
          ...query,
          where: { id: post.id },
          data: {
            state: 'DELETED',
            publishedRevision: post.publishedRevisionId ? { update: { kind: 'ARCHIVED' } } : undefined,
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
          include: { space: true, publishedRevision: true },
          where: { id: input.postId },
        });

        if (!post.space || !post.publishedRevision?.price) {
          throw new IntentionalError('구매할 수 없는 포스트예요');
        }

        const isMember = await db.spaceMember.existsUnique({
          where: {
            spaceId_userId: {
              spaceId: post.space.id,
              userId: context.session.userId,
            },
          },
        });

        if (isMember) {
          throw new IntentionalError('자신이 속한 스페이스의 포스트는 구매할 수 없어요');
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
            pointAmount: post.publishedRevision.price,
          },
        });

        await deductUserPoint({
          db,
          userId: context.session.userId,
          amount: post.publishedRevision.price,
          targetId: purchase.id,
          cause: 'UNLOCK_CONTENT',
        });

        await createRevenue({
          db,
          userId: post.userId,
          amount: post.publishedRevision.price,
          targetId: purchase.id,
          kind: 'POST_PURCHASE',
        });

        const masquerade = await makeMasquerade({
          db,
          userId: context.session.userId,
          spaceId: post.space.id,
        });

        await createNotification({
          db,
          userId: post.userId,
          category: 'PURCHASE',
          actorId: masquerade.profileId,
          data: { postId: post.id },
          origin: context.event.url.origin,
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

          const viewCount = await redis.get(`Post:${input.postId}:viewCount`);
          if (viewCount) {
            await redis.incr(`Post:${input.postId}:viewCount`);
          }
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
