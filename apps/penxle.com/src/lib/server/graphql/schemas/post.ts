import { init as cuid } from '@paralleldrive/cuid2';
import { hash, verify } from 'argon2';
import dayjs from 'dayjs';
import { and, asc, count, desc, eq, exists, gt, isNotNull, isNull, lt, ne, notExists, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { match, P } from 'ts-pattern';
import { emojiData } from '$lib/emoji';
import { FormValidationError, IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { redis } from '$lib/server/cache';
import {
  BookmarkGroupPosts,
  BookmarkGroups,
  database,
  dbEnum,
  PostAgeRating,
  PostCategory,
  PostCommentQualification,
  PostComments,
  PostLikes,
  PostPair,
  PostPurchases,
  PostReactions,
  PostRevisionContents,
  PostRevisionKind,
  PostRevisions,
  Posts,
  PostState,
  PostTagKind,
  PostTags,
  PostViews,
  PostVisibility,
  SpaceCollectionPosts,
  SpaceCollections,
  SpaceMasquerades,
  SpaceMembers,
  Spaces,
  UserContentFilterPreferences,
} from '$lib/server/database';
import { elasticSearch, indexName } from '$lib/server/search';
import {
  createNotification,
  createRevenue,
  deductUserPoint,
  generatePostShareImage,
  getMutedSpaceIds,
  getMutedTagIds,
  getPostViewCount,
  getUserPoint,
  indexPost,
  indexPostTrendingScore,
  isAdulthood,
  isGte15,
  makeMasquerade,
  makeQueryContainers,
  revisePostContent,
  searchResultToPrismaData,
  useFirstRow,
  useFirstRowOrThrow,
} from '$lib/server/utils';
import { decorateContent, isEmptyContent, revisionContentToText, sanitizeContent } from '$lib/server/utils/tiptap';
import {
  base36To10,
  createId,
  createTiptapDocument,
  createTiptapNode,
  makeNullableArrayElement,
  validateTiptapDocument,
} from '$lib/utils';
import { PublishPostInputSchema, RevisePostInputSchema } from '$lib/validations/post';
import { builder } from '../builder';
import { makeLoadableObjectFields } from '../utils';
import { BookmarkGroup } from './bookmark';
import { SpaceCollection } from './collection';
import { PostComment } from './comment';
import { Image } from './image';
import { Space, SpaceMember } from './space';
import { PostTag } from './tag';
import type { JSONContent } from '@tiptap/core';

/**
 * * Types
 */

const CommentOrderByKind = builder.enumType('CommentOrderByKind', {
  values: ['LATEST', 'OLDEST'] as const,
});

export const Post = builder.loadableObject('Post', {
  ...makeLoadableObjectFields(Posts),
  // grantScopes: async (post, { db, ...context }) => {
  // 글 관리 권한이 있는지 체크
  // if (context.session?.userId === post.userId) {
  //   return ['$post:view', '$post:edit'];
  // }

  // const spaceMemberLoader = Loader.spaceMember({ db, context });
  // const member = await spaceMemberLoader.load(post.spaceId);

  // if (member?.role === 'ADMIN') {
  //   return ['$post:view', '$post:edit'];
  // }

  // // 이 이하부터 글 관리 권한 없음
  // // 글을 볼 권한이 없는지 체크

  // if (post.state !== 'PUBLISHED' || (post.visibility === 'SPACE' && member?.role !== 'MEMBER')) {
  //   const purchase = context.session
  //     ? await db.postPurchase.exists({
  //         where: {
  //           postId: post.id,
  //           userId: context.session.userId,
  //         },
  //       })
  //     : false;

  //   if (!purchase) {
  //     return [];
  //   }
  // }

  // return ['$post:view'];
  // },
  fields: (t) => ({
    id: t.exposeID('id'),
    state: t.expose('state', { type: dbEnum(PostState) }),

    permalink: t.exposeString('permalink'),
    shortlink: t.string({
      resolve: ({ permalink }) => BigInt(permalink).toString(36),
    }),

    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    publishedAt: t.expose('publishedAt', { type: 'DateTime', nullable: true }),

    member: t.field({
      type: SpaceMember,
      nullable: true,
      resolve: (post) => post.memberId,
    }),

    space: t.field({
      type: Space,
      nullable: true,
      resolve: (post) => post.spaceId,
    }),

    tags: t.field({
      type: [PostTag],
      resolve: async (post) => {
        const tags = await database.select({ id: PostTags.id }).from(PostTags).where(eq(PostTags.postId, post.id));
        return tags.map((tag) => tag.id);
      },
    }),

    visibility: t.expose('visibility', { type: dbEnum(PostVisibility) }),
    ageRating: t.expose('ageRating', { type: dbEnum(PostAgeRating) }),
    externalSearchable: t.exposeBoolean('externalSearchable'),
    category: t.expose('category', { type: dbEnum(PostCategory) }),
    pairs: t.expose('pairs', { type: [dbEnum(PostPair)] }),

    discloseStats: t.exposeBoolean('discloseStats'),
    receiveFeedback: t.exposeBoolean('receiveFeedback'),
    receivePatronage: t.exposeBoolean('receivePatronage'),
    receiveTagContribution: t.exposeBoolean('receiveTagContribution'),
    protectContent: t.exposeBoolean('protectContent'),
    commentQualification: t.expose('commentQualification', { type: dbEnum(PostCommentQualification) }),

    thumbnail: t.field({
      type: Image,
      nullable: true,
      // authScopes: { $granted: '$post:view' },
      resolve: (post) => post.thumbnailId,
      unauthorizedResolver: () => null,
    }),

    likeCount: t.int({
      resolve: async (post) => {
        const [{ value }] = await database
          .select({ value: count() })
          .from(PostLikes)
          .where(eq(PostLikes.postId, post.id));
        return value;
      },
    }),

    viewCount: t.int({
      resolve: (post) => getPostViewCount({ postId: post.id }),
    }),

    viewed: t.boolean({
      resolve: async (post, _, context) => {
        if (!context.session) {
          return false;
        }

        const views = await database
          .select({ id: PostViews.id })
          .from(PostViews)
          .where(and(eq(PostViews.postId, post.id), eq(PostViews.userId, context.session.userId)));

        return views.length > 0;
      },
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

    blurred: t.boolean({
      resolve: async (post, _, context) => {
        if (post.ageRating !== 'ALL' && !context.session) {
          return true;
        }

        const triggerTags = await database
          .select({ id: PostTags.id })
          .from(PostTags)
          .where(and(eq(PostTags.postId, post.id), eq(PostTags.kind, 'TRIGGER')));

        if (triggerTags.length > 0) {
          return true;
        }

        if (post.ageRating === 'ALL') {
          return false;
        }

        const adultFilters = await database
          .select({ action: UserContentFilterPreferences.action })
          .from(UserContentFilterPreferences)
          .where(
            and(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              eq(UserContentFilterPreferences.userId, context.session!.userId),
              eq(UserContentFilterPreferences.category, 'ADULT'),
            ),
          );

        return adultFilters[0]?.action !== 'EXPOSE';
      },
    }),

    publishedRevision: t.field({
      type: PostRevision,
      nullable: true,
      // authScopes: { $granted: '$post:view' },
      resolve: (post) => post.publishedRevisionId,
      unauthorizedResolver: () => null,
    }),

    revisions: t.field({
      type: [PostRevision],
      // authScopes: { $granted: '$post:edit' },
      // grantScopes: ['$postRevision:edit'],
      resolve: async (post) =>
        await database
          .select({ id: PostRevisions.id })
          .from(PostRevisions)
          .where(eq(PostRevisions.postId, post.id))
          .then((revisions) => revisions.map((revision) => revision.id)),
    }),

    draftRevision: t.field({
      type: PostRevision,
      // authScopes: { $granted: '$post:edit' },
      // grantScopes: ['$postRevision:edit'],
      args: { revisionId: t.arg.id({ required: false }) },
      resolve: async (post, { revisionId }) => {
        if (revisionId) {
          return revisionId;
        }

        return await database
          .select({ id: PostRevisions.id })
          .from(PostRevisions)
          .where(eq(PostRevisions.postId, post.id))
          .orderBy(desc(PostRevisions.createdAt))
          .limit(1)
          .then((revisions) => revisions[0].id);
      },
    }),

    liked: t.boolean({
      resolve: async (post, _, context) => {
        if (!context.session) {
          return false;
        }

        const likes = await database
          .select({ id: PostLikes.id })
          .from(PostLikes)
          .where(and(eq(PostLikes.postId, post.id), eq(PostLikes.userId, context.session.userId)));

        return likes.length > 0;
      },
    }),

    reactions: t.field({
      type: [PostReaction],
      resolve: async (post, _, context) => {
        if (!post.receiveFeedback) {
          return [];
        }

        if (!context.session) {
          return await database
            .select()
            .from(PostReactions)
            .where(eq(PostReactions.postId, post.id))
            .orderBy(desc(PostReactions.createdAt));
        }

        return [
          ...(await database
            .select()
            .from(PostReactions)
            .where(and(eq(PostReactions.postId, post.id), eq(PostReactions.userId, context.session.userId)))
            .orderBy(desc(PostReactions.createdAt))),
          ...(await database
            .select()
            .from(PostReactions)
            .where(and(eq(PostReactions.postId, post.id), ne(PostReactions.userId, context.session.userId)))
            .orderBy(desc(PostReactions.createdAt))),
        ];
      },
    }),

    reactionCount: t.int({
      resolve: async (post) =>
        await database
          .select({ count: count() })
          .from(PostReactions)
          .where(eq(PostReactions.postId, post.id))
          .then(([{ count }]) => count),
    }),

    bookmarkGroups: t.field({
      type: [BookmarkGroup],
      resolve: async (post, _, context) => {
        if (!context.session) {
          return [];
        }

        return await database
          .select({ id: BookmarkGroups.id })
          .from(BookmarkGroups)
          .innerJoin(BookmarkGroupPosts, eq(BookmarkGroups.id, BookmarkGroupPosts.bookmarkGroupId))
          .where(and(eq(BookmarkGroups.userId, context.session.userId), eq(BookmarkGroupPosts.postId, post.id)))
          .then((groups) => groups.map((group) => group.id));
      },
    }),

    collection: t.field({
      type: SpaceCollection,
      nullable: true,
      resolve: async (post) =>
        database
          .select({ id: SpaceCollections.id })
          .from(SpaceCollections)
          .innerJoin(SpaceCollectionPosts, eq(SpaceCollections.id, SpaceCollectionPosts.collectionId))
          .where(and(eq(SpaceCollectionPosts.postId, post.id), eq(SpaceCollections.state, 'ACTIVE')))
          .then((collections) => collections[0]?.id),
    }),

    purchasedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: async (post, _, context) => {
        if (!context.session) {
          return null;
        }

        return await database
          .select({ createdAt: PostPurchases.createdAt })
          .from(PostPurchases)
          .where(and(eq(PostPurchases.postId, post.id), eq(PostPurchases.userId, context.session.userId)))
          .then((purchases) => purchases[0]?.createdAt);
      },
    }),

    previousPost: t.field({
      type: Post,
      nullable: true,
      resolve: async (post) => {
        if (!post.publishedAt || !post.spaceId) {
          return null;
        }

        return await database
          .select()
          .from(Posts)
          .where(
            and(
              eq(Posts.spaceId, post.spaceId),
              eq(Posts.state, 'PUBLISHED'),
              eq(Posts.visibility, 'PUBLIC'),
              lt(Posts.publishedAt, post.publishedAt),
            ),
          )
          .orderBy(desc(Posts.publishedAt))
          .limit(1);
      },
    }),

    nextPost: t.field({
      type: Post,
      nullable: true,
      resolve: async (post) => {
        if (!post.publishedAt || !post.spaceId) {
          return null;
        }

        return await database
          .select()
          .from(Posts)
          .where(
            and(
              eq(Posts.spaceId, post.spaceId),
              eq(Posts.state, 'PUBLISHED'),
              eq(Posts.visibility, 'PUBLIC'),
              gt(Posts.publishedAt, post.publishedAt),
            ),
          )
          .orderBy(asc(Posts.publishedAt))
          .limit(1);
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
            function_score: {
              query: {
                bool: {
                  should: [
                    { terms: { 'tags.id': postTagIds } },
                    { term: { ['spaceId']: post.spaceId } },
                    { rank_feature: { field: 'trendingScore' } },
                  ],
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
              functions: [
                {
                  random_score: { seed: Math.floor(Math.random() * 1000), field: '_seq_no' },
                },
              ],
            },
          },

          size: 3,
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

    commentCount: t.int({
      args: { pagination: t.arg.boolean({ defaultValue: false }) },
      resolve: async (post, { pagination }) => {
        if (pagination) {
          const ChildComments = alias(PostComments, 'child');

          return await database
            .select({ count: count() })
            .from(PostComments)
            .where(
              and(
                eq(PostComments.postId, post.id),
                isNull(PostComments.parentId),
                or(
                  eq(PostComments.state, 'ACTIVE'),
                  exists(
                    database
                      .select({ id: ChildComments.id })
                      .from(ChildComments)
                      .where(and(eq(ChildComments.parentId, PostComments.id), eq(ChildComments.state, 'ACTIVE'))),
                  ),
                ),
              ),
            )
            .then(([result]) => result.count);
        } else {
          return await database
            .select({ count: count() })
            .from(PostComments)
            .where(and(eq(PostComments.postId, post.id), eq(PostComments.state, 'ACTIVE')))
            .then(([result]) => result.count);
        }
      },
    }),

    comments: t.field({
      type: [PostComment],
      args: {
        orderBy: t.arg({ type: CommentOrderByKind, defaultValue: 'OLDEST' }),
        page: t.arg.int({ defaultValue: 1 }),
        take: t.arg.int({ defaultValue: 5 }),
      },
      resolve: async (post, { orderBy, page, take }) => {
        if (post.commentQualification === 'NONE') {
          return [];
        }

        const pinnedCommentIds = await database
          .select({ id: PostComments.id })
          .from(PostComments)
          .where(
            and(
              eq(PostComments.postId, post.id),
              eq(PostComments.state, 'ACTIVE'),
              eq(PostComments.pinned, true),
              notExists(
                database
                  .select({ id: SpaceMasquerades.id })
                  .from(SpaceMasquerades)
                  .where(
                    and(eq(SpaceMasquerades.profileId, PostComments.profileId), isNotNull(SpaceMasquerades.blockedAt)),
                  ),
              ),
            ),
          )
          .orderBy(orderBy === 'OLDEST' ? asc(PostComments.createdAt) : desc(PostComments.createdAt))
          .then((comments) => comments.map((comment) => comment.id));

        const pagedPinnedCommentIds = pinnedCommentIds.slice((page - 1) * take, page * take);
        if (pagedPinnedCommentIds.length === take) {
          return pagedPinnedCommentIds;
        }

        const ChildComments = alias(PostComments, 'child');

        const comments = await database
          .select()
          .from(PostComments)
          .where(
            and(
              eq(PostComments.postId, post.id),
              isNull(PostComments.parentId),
              eq(PostComments.pinned, false),
              or(
                eq(PostComments.state, 'ACTIVE'),
                exists(
                  database
                    .select({ id: ChildComments.id })
                    .from(ChildComments)
                    .where(and(eq(ChildComments.parentId, PostComments.id), eq(ChildComments.state, 'ACTIVE'))),
                ),
              ),
              notExists(
                database
                  .select({ id: SpaceMasquerades.id })
                  .from(SpaceMasquerades)
                  .where(
                    and(eq(SpaceMasquerades.profileId, PostComments.profileId), isNotNull(SpaceMasquerades.blockedAt)),
                  ),
              ),
            ),
          )
          .orderBy(orderBy === 'OLDEST' ? asc(PostComments.createdAt) : desc(PostComments.createdAt))
          .limit(take - pagedPinnedCommentIds.length)
          .offset(Math.max(0, (page - 1) * take - pinnedCommentIds.length));

        return [...pagedPinnedCommentIds, ...comments];
      },
    }),

    purchasedRevision: t.withAuth({ user: true }).field({
      type: PostRevision,
      nullable: true,
      resolve: async (post, _, context) => {
        return await database
          .select({ revisionId: PostPurchases.revisionId })
          .from(PostPurchases)
          .where(and(eq(PostPurchases.postId, post.id), eq(PostPurchases.userId, context.session.userId)))
          .then(([purchase]) => purchase?.revisionId);
      },
    }),
  }),
});

export const PostRevision = builder.loadableObject('PostRevision', {
  ...makeLoadableObjectFields(PostRevisions),
  // grantScopes: async (revision, { db, ...context }) => {
  //   const postLoader = Loader.post({ db, context });
  //   const post = await postLoader.load(revision.postId);

  //   if (!post) {
  //     return [];
  //   }

  //   if (post.ageRating !== 'ALL') {
  //     if (!context.session) {
  //       return [];
  //     }

  //     const identity = await db.userPersonalIdentity.findUnique({
  //       where: { userId: context.session.userId },
  //     });

  //     if (
  //       !identity ||
  //       (post.ageRating === 'R19' && !isAdulthood(identity.birthday)) ||
  //       (post.ageRating === 'R15' && !isGte15(identity.birthday))
  //     ) {
  //       return [];
  //     }
  //   }

  //   if (post.password && post.userId !== context.session?.userId) {
  //     const unlock = await redis.hget(`Post:${post.id}:passwordUnlock`, context.deviceId);
  //     if (!unlock || dayjs().isAfter(dayjs(unlock))) {
  //       return [];
  //     }
  //   }

  //   if (post.spaceId) {
  //     const spaceMasqueradeLoader = Loader.spaceMasquerade({ db, context });
  //     const masquerade = await spaceMasqueradeLoader.load(post.spaceId);
  //     if (masquerade?.blockedAt) {
  //       return [];
  //     }
  //   }

  //   return ['$postRevision:view'];
  // },
  fields: (t) => ({
    id: t.exposeID('id'),
    kind: t.expose('kind', { type: dbEnum(PostRevisionKind) }),
    title: t.exposeString('title', { nullable: true }),
    subtitle: t.exposeString('subtitle', { nullable: true }),
    price: t.exposeInt('price', { nullable: true }),
    paragraphIndent: t.exposeInt('paragraphIndent'),
    paragraphSpacing: t.exposeInt('paragraphSpacing'),

    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    editableContent: t.field({
      type: 'JSON',
      // authScopes: { $granted: '$postRevision:edit' },
      resolve: async (revision) => {
        const [freeContentRaw, paidContentRaw] = await Promise.all([
          revision.freeContentId
            ? database
                .select({ data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, revision.freeContentId))
                .then((contents) => contents[0]?.data as JSONContent[])
            : undefined,
          revision.paidContentId
            ? database
                .select({ data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, revision.paidContentId))
                .then((contents) => contents[0]?.data as JSONContent[])
            : undefined,
        ]);

        const [freeContent, paidContent] = await Promise.all([
          freeContentRaw ? decorateContent(freeContentRaw) : [{ type: 'paragraph' }],
          paidContentRaw ? decorateContent(paidContentRaw) : [],
        ]);

        return createTiptapDocument([
          ...freeContent,
          createTiptapNode({ type: 'access_barrier', attrs: { price: revision.price } }),
          ...(paidContent ?? []),
        ]);
      },
    }),

    content: t.field({
      type: 'JSON',
      // authScopes: { $granted: '$postRevision:view' },
      resolve: async (revision, _, context) => {
        const [freeContentRaw, paidContentRaw] = await Promise.all([
          revision.freeContentId
            ? database
                .select({ data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, revision.freeContentId))
                .then((contents) => contents[0]?.data as JSONContent[])
            : undefined,
          revision.paidContentId
            ? database
                .select({ data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, revision.paidContentId))
                .then((contents) => contents[0]?.data as JSONContent[])
            : undefined,
        ]);

        const [freeContent, paidContent] = await Promise.all([
          freeContentRaw ? decorateContent(freeContentRaw) : [{ type: 'paragraph' }],
          paidContentRaw ? decorateContent(paidContentRaw) : null,
        ]);

        if (!paidContent || paidContent.length === 0) {
          return createTiptapDocument(freeContent);
        }

        // 유료분이 있음 - 유료분을 볼 수 있는 경우는?

        if (context.session) {
          const post = await database
            .select()
            .from(Posts)
            .where(eq(Posts.id, revision.postId))
            .then((posts) => posts[0]);

          if (context.session.userId === post.userId) {
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

          if (post.spaceId) {
            const purchase = await database
              .select({ createdAt: PostPurchases.createdAt })
              .from(PostPurchases)
              .where(and(eq(PostPurchases.postId, post.id), eq(PostPurchases.userId, context.session.userId)))
              .then(makeNullableArrayElement)
              .then((purchases) => purchases[0]);

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

            const meAsMember = await database
              .select({ id: SpaceMembers.id })
              .from(SpaceMembers)
              .where(and(eq(SpaceMembers.spaceId, post.spaceId), eq(SpaceMembers.userId, context.session.userId)))
              .then(makeNullableArrayElement)
              .then((members) => members[0]);

            if (meAsMember) {
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

        const paidContentText = revision.paidContentId
          ? await revisionContentToText({ id: revision.paidContentId, data: paidContent })
          : '';

        let paidContentImageCount = 0,
          paidContentFileCount = 0;
        for (const node of paidContent) {
          // eslint-disable-next-line unicorn/prefer-switch
          if (node.type === 'image') {
            paidContentImageCount++;
          } else if (node.type === 'gallery') {
            paidContentImageCount += node.attrs?.ids?.length ?? 0;
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

                point: context.session ? await getUserPoint({ userId: context.session.userId }) : null,

                postId: revision.postId,
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

    characterCount: t.int({
      // authScopes: { $granted: '$postRevision:view' },
      resolve: async (revision) => {
        const [freeContentLength, paidContentLength] = await Promise.all([
          revision.freeContentId
            ? database
                .select({ id: PostRevisionContents.id, data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, revision.freeContentId))
                .then((contents) => revisionContentToText(contents[0]))
                .then((contentText) => contentText.length)
            : 0,
          revision.paidContentId
            ? database
                .select({ id: PostRevisionContents.id, data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, revision.paidContentId))
                .then((contents) => revisionContentToText(contents[0]))
                .then((contentText) => contentText.length)
            : 0,
        ]);

        return freeContentLength + paidContentLength;
      },

      unauthorizedResolver: () => 0,
    }),

    previewText: t.string({
      // authScopes: { $granted: '$postRevision:view' },
      resolve: async (revision) => {
        const contentText = revision.freeContentId
          ? await database
              .select({ id: PostRevisionContents.id, data: PostRevisionContents.data })
              .from(PostRevisionContents)
              .where(eq(PostRevisionContents.id, revision.freeContentId))
              .then((contents) => revisionContentToText(contents[0]))
          : '';

        return contentText.slice(0, 200).replaceAll(/\s+/g, ' ');
      },

      unauthorizedResolver: () => '',
    }),
  }),
});

export const PostReaction = builder.loadableObject('PostReaction', {
  ...makeLoadableObjectFields(PostReactions),
  fields: (t) => ({
    id: t.exposeID('id'),
    emoji: t.exposeString('emoji'),

    mine: t.boolean({
      resolve: (reaction, _, { ...context }) => {
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
    kind: t.field({ type: dbEnum(PostTagKind) }),
  }),
});

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: (t) => ({
    spaceId: t.id({ required: false }),
  }),
});

const RevisePostInput = builder.inputType('RevisePostInput', {
  fields: (t) => ({
    revisionKind: t.field({ type: dbEnum(PostRevisionKind) }),

    postId: t.id(),

    title: t.string({ required: false }),
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
    visibility: t.field({ type: dbEnum(PostVisibility) }),
    password: t.string({ required: false }),
    ageRating: t.field({ type: dbEnum(PostAgeRating) }),
    externalSearchable: t.boolean(),
    discloseStats: t.boolean(),
    receiveFeedback: t.boolean(),
    receivePatronage: t.boolean(),
    receiveTagContribution: t.boolean(),
    protectContent: t.boolean(),
    commentQualification: t.field({
      type: dbEnum(PostCommentQualification),
      required: false,
      defaultValue: 'ANY',
    }),
    category: t.field({ type: dbEnum(PostCategory) }),
    pairs: t.field({ type: [dbEnum(PostPair)], defaultValue: [] }),
    tags: t.field({ type: [TagInput], defaultValue: [] }),
  }),
  validate: { schema: PublishPostInputSchema },
});

const UpdatePostOptionsInput = builder.inputType('UpdatePostOptionsInput', {
  fields: (t) => ({
    postId: t.id(),
    visibility: t.field({ type: dbEnum(PostVisibility), required: false }),
    discloseStats: t.boolean({ required: false }),
    receiveFeedback: t.boolean({ required: false }),
    receivePatronage: t.boolean({ required: false }),
    receiveTagContribution: t.boolean({ required: false }),
  }),
});

const UpdatePostTagsInput = builder.inputType('UpdatePostTagsInput', {
  fields: (t) => ({
    postId: t.id(),
    category: t.field({ type: dbEnum(PostCategory) }),
    pairs: t.field({ type: [dbEnum(PostPair)] }),
    tags: t.field({ type: [TagInput] }),
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

const GeneratePostShareImageInput = builder.inputType('GeneratePostShareImageInput', {
  fields: (t) => ({
    title: t.string(),
    space: t.string(),
    body: t.string(),
    font: t.string(), // Pretendard, RIDIBatang
    size: t.string(), // small, medium, large
    color: t.string(), // hex code
    background: t.string(), // hex code
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  post: t.field({
    type: Post,
    args: { permalink: t.arg.string() },
    resolve: async (_, { permalink }, context) => {
      const post = await database
        .select({
          Posts,
          Spaces,
        })
        .from(Posts)
        .leftJoin(Spaces, eq(Posts.spaceId, Spaces.id))
        .where(eq(Posts.permalink, permalink))
        .then(useFirstRowOrThrow(new NotFoundError()))
        .then((posts) => ({
          ...posts.Posts,
          space: posts.Spaces,
        }));

      if (post.userId !== context.session?.userId || post.state === 'DELETED') {
        if (!post.space) {
          throw new NotFoundError();
        }
        if (
          post.space.state === 'INACTIVE' ||
          post.space.visibility === 'PRIVATE' ||
          post.state === 'DRAFT' ||
          post.visibility === 'SPACE' ||
          post.state === 'DELETED'
        ) {
          if (!context.session) {
            throw new PermissionDeniedError();
          }

          const member =
            post.state === 'DELETED'
              ? null
              : await database
                  .select({ role: SpaceMembers.role })
                  .from(SpaceMembers)
                  .where(
                    and(
                      eq(SpaceMembers.spaceId, post.space.id),
                      eq(SpaceMembers.userId, context.session.userId),
                      eq(SpaceMembers.state, 'ACTIVE'),
                    ),
                  )
                  .then(useFirstRow);

          if (!member || (post.state === 'DRAFT' && member.role !== 'ADMIN')) {
            await database
              .select({ id: PostPurchases.id })
              .from(PostPurchases)
              .where(and(eq(PostPurchases.postId, post.id), eq(PostPurchases.userId, context.session.userId)))
              .then(useFirstRowOrThrow(new PermissionDeniedError()));
          }
        }
      }

      return post.id;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createPost: t.withAuth({ user: true }).field({
    type: Post,
    args: { input: t.arg({ type: CreatePostInput }) },
    resolve: async (_, { input }, context) => {
      let permalink: string;

      for (;;) {
        permalink = base36To10(cuid({ length: 6 })());
        const exists = await database
          .select({ id: Posts.id })
          .from(Posts)
          .where(eq(Posts.permalink, permalink))
          .then(useFirstRow);
        if (!exists) {
          break;
        }
      }

      return await database.transaction(async (tx) => {
        const post = await tx
          .insert(Posts)
          .values({
            permalink,
            userId: context.session.userId,
            spaceId: input.spaceId,
            state: 'EPHEMERAL',
            visibility: 'PUBLIC',
            discloseStats: true,
            receiveFeedback: true,
            receivePatronage: true,
            receiveTagContribution: true,
            protectContent: true,
          })
          .returning()
          .then(useFirstRowOrThrow());

        await tx.insert(PostRevisions).values({
          postId: post.id,
          userId: context.session.userId,
          kind: 'AUTO_SAVE',
        });

        return post;
      });
    },
  }),

  revisePost: t.withAuth({ user: true }).field({
    type: Post,
    args: { input: t.arg({ type: RevisePostInput }) },
    resolve: async (_, { input }, context) => {
      const post = await database
        .select()
        .from(Posts)
        .where(and(eq(Posts.id, input.postId), ne(Posts.state, 'DELETED')))
        .then(useFirstRowOrThrow(new NotFoundError()));

      if (post.userId !== context.session.userId) {
        if (!post.spaceId) {
          throw new NotFoundError();
        }

        await database
          .select({ id: SpaceMembers.id })
          .from(SpaceMembers)
          .where(
            and(
              eq(SpaceMembers.spaceId, post.spaceId),
              eq(SpaceMembers.userId, context.session.userId),
              eq(SpaceMembers.state, 'ACTIVE'),
              eq(SpaceMembers.role, 'ADMIN'),
            ),
          )
          .then(useFirstRowOrThrow(new NotFoundError()));
      }

      let document = (input.content as JSONContent).content;

      if (!document || !validateTiptapDocument(input.content)) {
        throw new FormValidationError('content', '잘못된 내용이에요');
      }

      const FreeContents = alias(PostRevisionContents, 'freeContent');
      const PaidContents = alias(PostRevisionContents, 'paidContent');

      const lastRevision = await database
        .select({ revision: PostRevisions, FreeContents, PaidContents })
        .from(PostRevisions)
        .leftJoin(FreeContents, eq(FreeContents.id, PostRevisions.freeContentId))
        .leftJoin(PaidContents, eq(PaidContents.id, PostRevisions.paidContentId))
        .where(eq(PostRevisions.postId, input.postId))
        .orderBy(desc(PostRevisions.createdAt))
        .then(useFirstRow)
        .then((row) => {
          if (!row) {
            return;
          }

          return {
            ...row.revision,
            freeContent: row.FreeContents,
            paidContent: row.PaidContents,
          };
        });

      document = await sanitizeContent(document);

      const accessBarrierPosition = document.findIndex((node) => node.type === 'access_barrier');
      const accessBarrier = document[accessBarrierPosition];
      const freeContentData = document.slice(0, accessBarrierPosition);
      const paidContentData = document.slice(accessBarrierPosition + 1);

      const freeContent = isEmptyContent(freeContentData)
        ? null
        : await revisePostContent({ contentData: freeContentData });
      const paidContent = isEmptyContent(paidContentData)
        ? null
        : await revisePostContent({ contentData: paidContentData });
      const price: number | null = paidContent ? accessBarrier.attrs?.price ?? null : null;

      const revisionData = {
        userId: context.session.userId,
        kind: input.revisionKind,
        title: input.title?.length ? input.title : null,
        subtitle: input.subtitle?.length ? input.subtitle : null,
        freeContentId: freeContent?.id ?? null,
        paidContentId: paidContent?.id ?? null,
        price,
        paragraphIndent: input.paragraphIndent,
        paragraphSpacing: input.paragraphSpacing,
      } as const;

      /// 여기까지 데이터 가공 단계
      /// 여기부터 포스트 수정 단계

      // 2. 리비전 생성/재사용

      let revisionId = createId();

      const checkContentLengthDiff = async () => {
        if (!lastRevision) return 0;
        const lastRevisionContentLength =
          (lastRevision.freeContent ? await revisionContentToText(lastRevision.freeContent) : '').length +
          (lastRevision.paidContent ? await revisionContentToText(lastRevision.paidContent) : '').length;
        const currentContentLength =
          (freeContent ? await revisionContentToText(freeContent) : '').length +
          (paidContent ? await revisionContentToText(paidContent) : '').length;

        return Math.abs(lastRevisionContentLength - currentContentLength);
      };

      if (
        lastRevision &&
        lastRevision.kind === 'AUTO_SAVE' &&
        dayjs(lastRevision.createdAt).add(1, 'minutes').isAfter(dayjs()) &&
        (await checkContentLengthDiff()) < 100
      ) {
        await database
          .update(PostRevisions)
          .set({
            ...revisionData,
            updatedAt: dayjs(),
          })
          .where(eq(PostRevisions.id, lastRevision.id));

        revisionId = lastRevision.id;

        // dangling PostContent 삭제
        if (lastRevision.freeContentId) {
          const freeContentReference = await database
            .select({ id: PostRevisions.id })
            .from(PostRevisions)
            .where(
              or(
                eq(PostRevisions.freeContentId, lastRevision.freeContentId),
                eq(PostRevisions.paidContentId, lastRevision.freeContentId),
              ),
            )
            .limit(1)
            .then((rows) => rows.length > 0);

          if (!freeContentReference) {
            await database
              .delete(PostRevisionContents)
              .where(eq(PostRevisionContents.id, lastRevision.freeContentId))
              .catch(() => null);
          }
        }

        if (lastRevision.paidContentId) {
          const paidContentReference = await database
            .select({ id: PostRevisions.id })
            .from(PostRevisions)
            .where(
              or(
                eq(PostRevisions.freeContentId, lastRevision.paidContentId),
                eq(PostRevisions.paidContentId, lastRevision.paidContentId),
              ),
            )
            .limit(1)
            .then((rows) => rows.length > 0);

          if (!paidContentReference) {
            await database
              .delete(PostRevisionContents)
              .where(eq(PostRevisionContents.id, lastRevision.paidContentId))
              .catch(() => null);
          }
        }
      } else {
        await database.insert(PostRevisions).values({
          id: revisionId,
          postId: post.id,
          ...revisionData,
        });
      }

      /// 게시글에 수정된 부분이 있을 경우 포스트 상태를 DRAFT로 변경
      if (post.state === 'EPHEMERAL' && (input.title?.length || input.subtitle?.length || freeContent || paidContent)) {
        await database.update(Posts).set({ state: 'DRAFT' }).where(eq(Posts.id, input.postId));
      }

      /// 여기까지 포스트 생성/수정 단계

      return post;
    },
  }),

  publishPost: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: PublishPostInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const revision = await db.postRevision.update({
        include: { post: true, freeContent: true, paidContent: true },
        where: {
          id: input.revisionId,
          post: {
            state: { not: 'DELETED' },
          },
        },
        data: { kind: 'PUBLISHED' },
      });

      if (revision.post.state === 'PUBLISHED' && revision.post.spaceId && revision.post.spaceId !== input.spaceId) {
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

      if (revision.paidContent) {
        if (revision.price === null) {
          if ((revision.paidContent.data as JSONContent[] | undefined)?.length === 0) {
            await db.postRevision.update({
              where: { id: input.revisionId },
              data: { paidContentId: null },
            });
          } else {
            throw new IntentionalError('가격을 설정해주세요');
          }
        } else {
          if (revision.price <= 0 || revision.price > 1_000_000 || revision.price % 100 !== 0) {
            throw new IntentionalError('잘못된 가격이에요');
          }
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
          tags: { include: { tag: true } },
          publishedRevision: true,
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
          protectContent: input.protectContent,
          commentQualification: input.commentQualification ?? 'ANY',
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

      if (input.collectionId) {
        if (post.collectionPost?.collectionId !== input.collectionId) {
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
        }
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
          tags: { include: { tag: true } },
          publishedRevision: true,
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

  updatePostTags: t.withAuth({ user: true }).prismaField({
    type: 'Post',
    args: { input: t.arg({ type: UpdatePostTagsInput }) },
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

                state: 'ACTIVE',
              },
            })
          : null;

        if (meAsMember?.role !== 'ADMIN') {
          throw new PermissionDeniedError();
        }
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

      return db.post.update({
        ...query,
        where: { id: post.id },
        data: {
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

        indexPostTrendingScore({ db, postId: input.postId }).then();
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

  generatePostShareImage: t.string({
    args: { input: t.arg({ type: GeneratePostShareImageInput }) },
    resolve: async (_, { input }) => {
      const png = await generatePostShareImage(input);
      return `data:image/png;base64,${png.toString('base64')}`;
    },
  }),
}));
