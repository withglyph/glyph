import dayjs from 'dayjs';
import { and, count, eq, gte, isNotNull, ne } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import * as R from 'radash';
import { RedeemCodeGroupState, RedeemCodeState } from '$lib/enums';
import { IntentionalError, NotFoundError, PermissionDeniedError } from '$lib/errors';
import { redis } from '$lib/server/cache';
import {
  database,
  inArray,
  PostPurchases,
  PostRevisions,
  Posts,
  RedeemCodeGroups,
  RedeemCodeRedemptions,
  RedeemCodes,
} from '$lib/server/database';
import { getSpaceMember, useFirstRow, useFirstRowOrThrow } from '$lib/server/utils';
import { builder } from '../builder';
import { createObjectRef } from '../utils';
import { Post, PostPurchase } from './post';
import type { Transaction } from '$lib/server/database';

// cspell:disable-next-line
const generateRedeemCode = customAlphabet('HMN34P67R9TWCXYF', 20);

const checkRedeemCodeGroupState = async (groupId: string, tx?: Transaction) => {
  const db = tx ?? database;

  const availableCodeCount = await db
    .select({ count: count() })
    .from(RedeemCodes)
    .where(and(eq(RedeemCodes.groupId, groupId), eq(RedeemCodes.state, 'AVAILABLE')))
    .then((rows) => rows[0].count ?? 0);

  if (availableCodeCount === 0) {
    await db.update(RedeemCodeGroups).set({ state: 'INACTIVE' }).where(eq(RedeemCodeGroups.id, groupId));
  }
};

/**
 * * Types
 */

export const RedeemCode = createObjectRef('Redeem', RedeemCodes);
RedeemCode.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    state: t.expose('state', { type: RedeemCodeState }),
    code: t.exposeString('code'),

    formattedCode: t.field({
      type: 'String',
      resolve: (redeemCode) => redeemCode.code.match(/.{1,4}/g)?.join('-') ?? '',
    }),

    qrCodeUrl: t.field({
      type: 'String',
      resolve: (redeemCode, _, context) => `${context.event.url.origin}/api/redeem/qr/{${redeemCode.code}.png`,
    }),

    redemption: t.field({
      type: RedeemCodeRedemption,
      resolve: async (code, _, context) => {
        const loader = context.loader({
          name: 'RedeemCodeRedemption(codeId)',
          load: async (codeIds: string[]) => {
            return await database
              .select()
              .from(RedeemCodeRedemptions)
              .where(inArray(RedeemCodeRedemptions.codeId, codeIds));
          },
          key: (redemption) => redemption.codeId,
        });

        return await loader.load(code.id);
      },
    }),
  }),
});

export const RedeemCodeRedemption = createObjectRef('RedeemCodeRedemption', RedeemCodeRedemptions);
RedeemCodeRedemption.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    postPurchase: t.field({
      type: PostPurchase,
      resolve: (redemption) => redemption.purchaseId,
    }),
  }),
});

export const RedeemCodeGroup = createObjectRef('RedeemCodeGroup', RedeemCodeGroups);
RedeemCodeGroup.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    state: t.expose('state', { type: RedeemCodeGroupState }),
    description: t.exposeString('description', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime' }),

    post: t.field({
      type: Post,
      resolve: (group) => group.postId,
    }),

    codes: t.field({
      type: [RedeemCode],
      args: {
        state: t.arg({ type: RedeemCodeState, required: false }),
        page: t.arg({ type: 'Int', defaultValue: 1 }),
        take: t.arg({ type: 'Int', defaultValue: 10 }),
      },
      resolve: async (group, args) => {
        if (args.state) {
          return await database
            .select()
            .from(RedeemCodes)
            .where(and(eq(RedeemCodes.groupId, group.id), eq(RedeemCodes.state, args.state)))
            .orderBy(RedeemCodes.id)
            .limit(args.take)
            .offset((args.page - 1) * args.take);
        } else {
          const availableRedeemCodes = await database
            .select()
            .from(RedeemCodes)
            .where(and(eq(RedeemCodes.groupId, group.id), eq(RedeemCodes.state, 'AVAILABLE')))
            .orderBy(RedeemCodes.id)
            .limit(args.take)
            .offset((args.page - 1) * args.take);

          if (availableRedeemCodes.length === args.take) {
            return availableRedeemCodes;
          }

          const take = args.take - availableRedeemCodes.length;
          const offset =
            availableRedeemCodes.length > 0
              ? 0
              : await database
                  .select({ count: count() })
                  .from(RedeemCodes)
                  .where(and(eq(RedeemCodes.groupId, group.id), eq(RedeemCodes.state, 'AVAILABLE')))
                  .then((rows) => rows[0].count ?? 0)
                  .then((count) => (args.page - 1) * args.take - count);

          return [
            ...availableRedeemCodes,
            ...(await database
              .select()
              .from(RedeemCodes)
              .where(and(eq(RedeemCodes.groupId, group.id), ne(RedeemCodes.state, 'AVAILABLE')))
              .orderBy(RedeemCodes.id)
              .limit(take)
              .offset(offset)),
          ];
        }
      },
    }),

    codeCount: t.field({
      type: 'Int',
      resolve: async (group, _, context) => {
        const loader = context.loader({
          name: 'RedeemCodeGroup.codeCount',
          nullable: true,
          load: async (groupIds: string[]) => {
            return await database
              .select({ groupId: RedeemCodes.groupId, count: count() })
              .from(RedeemCodes)
              .where(inArray(RedeemCodes.groupId, groupIds))
              .groupBy(RedeemCodes.groupId);
          },

          key: (group) => group?.groupId,
        });

        return await loader.load(group.id).then((result) => result?.count ?? 0);
      },
    }),

    availableCodeCount: t.field({
      type: 'Int',
      resolve: async (group, _, context) => {
        const loader = context.loader({
          name: 'RedeemCodeGroup.availableCodeCount',
          nullable: true,
          load: async (groupIds: string[]) => {
            return await database
              .select({ groupId: RedeemCodes.groupId, count: count() })
              .from(RedeemCodes)
              .where(and(inArray(RedeemCodes.groupId, groupIds), eq(RedeemCodes.state, 'AVAILABLE')))
              .groupBy(RedeemCodes.groupId);
          },

          key: (group) => group?.groupId,
        });

        return await loader.load(group.id).then((result) => result?.count ?? 0);
      },
    }),
  }),
});

/**
 * * Inputs
 */

const CreateRedeemCodeGroupInput = builder.inputType('CreateRedeemCodeGroupInput', {
  fields: (t) => ({
    description: t.string({ required: false }),
    postId: t.id(),
    count: t.int(),
  }),
});

const RevokeRedeemCodeGroupInput = builder.inputType('RevokeRedeemCodeGroupInput', {
  fields: (t) => ({
    id: t.id(),
  }),
});

const RevokeRedeemCodeInput = builder.inputType('RevokeRedeemCodeInput', {
  fields: (t) => ({
    id: t.id(),
  }),
});

const RegisterRedeemCodeInput = builder.inputType('RegisterRedeemCodeInput', {
  fields: (t) => ({
    code: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  redeemCodeGroup: t.withAuth({ user: true }).field({
    type: RedeemCodeGroup,
    args: { id: t.arg.id() },
    resolve: (_, { id }, context) => {
      return database
        .select()
        .from(RedeemCodeGroups)
        .where(and(eq(RedeemCodeGroups.id, id), eq(RedeemCodeGroups.userId, context.session.userId)))
        .then(useFirstRowOrThrow(new NotFoundError()));
    },
  }),

  redeemCodeRedemption: t.withAuth({ user: true }).field({
    type: RedeemCodeRedemption,
    args: { id: t.arg.id() },
    resolve: (_, { id }, context) => {
      return database
        .select({ RedeemCodeRedemptions })
        .from(RedeemCodeRedemptions)
        .innerJoin(PostPurchases, eq(PostPurchases.id, RedeemCodeRedemptions.purchaseId))
        .where(and(eq(RedeemCodeRedemptions.id, id), eq(PostPurchases.userId, context.session.userId)))
        .then(useFirstRowOrThrow(new NotFoundError()))
        .then((redemption) => redemption.RedeemCodeRedemptions);
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createRedeemCodeGroup: t.withAuth({ user: true }).field({
    type: RedeemCodeGroup,
    args: { input: t.arg({ type: CreateRedeemCodeGroupInput }) },
    resolve: async (_, { input }, context) => {
      const post = await database
        .select({ id: Posts.id, spaceId: Posts.spaceId })
        .from(Posts)
        .innerJoin(PostRevisions, eq(PostRevisions.id, Posts.publishedRevisionId))
        .where(
          and(
            eq(Posts.id, input.postId),
            eq(Posts.state, 'PUBLISHED'),
            eq(Posts.userId, context.session.userId),
            isNotNull(PostRevisions.price),
            isNotNull(PostRevisions.paidContentId),
          ),
        )
        .then(useFirstRowOrThrow(new PermissionDeniedError()));

      const meAsMember = await getSpaceMember(context, post.spaceId);

      if (!meAsMember) {
        throw new PermissionDeniedError();
      }

      return await database.transaction(async (tx) => {
        const group = await tx
          .insert(RedeemCodeGroups)
          .values({
            userId: context.session.userId,
            // spaceId가 null이면 meAsMember가 null이라 위에서 걸림!
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            spaceId: post.spaceId!,
            memberId: meAsMember.id,
            postId: post.id,
            state: 'ACTIVE',
            description: input.description,
            expiresAt: dayjs.kst().add(1, 'year').endOf('day'),
          })
          .returning()
          .then(useFirstRowOrThrow());

        await tx.insert(RedeemCodes).values(
          Array.from({ length: input.count }).map(() => ({
            groupId: group.id,
            state: 'AVAILABLE' as const,
            code: generateRedeemCode(),
          })),
        );

        return group;
      });
    },
  }),

  revokeRedeemCodeGroup: t.withAuth({ user: true }).field({
    type: RedeemCodeGroup,
    args: { input: t.arg({ type: RevokeRedeemCodeGroupInput }) },
    resolve: async (_, { input }, context) => {
      const group = await database
        .select({ id: RedeemCodeGroups.id })
        .from(RedeemCodeGroups)
        .where(and(eq(RedeemCodeGroups.id, input.id), eq(RedeemCodeGroups.userId, context.session.userId)));

      if (group.length === 0) {
        throw new NotFoundError();
      }

      return await database.transaction(async (tx) => {
        await tx
          .update(RedeemCodes)
          .set({ state: 'REVOKED' })
          .where(and(eq(RedeemCodes.groupId, input.id), eq(RedeemCodes.state, 'AVAILABLE')));

        return await tx
          .update(RedeemCodeGroups)
          .set({ state: 'INACTIVE' })
          .where(eq(RedeemCodeGroups.id, input.id))
          .returning()
          .then(useFirstRowOrThrow());
      });
    },
  }),

  revokeRedeemCode: t.withAuth({ user: true }).field({
    type: RedeemCode,
    args: { input: t.arg({ type: RevokeRedeemCodeInput }) },
    resolve: async (_, { input }, context) => {
      const code = await database
        .select({ id: RedeemCodes.id, state: RedeemCodes.state })
        .from(RedeemCodes)
        .innerJoin(RedeemCodeGroups, eq(RedeemCodeGroups.id, RedeemCodes.groupId))
        .where(and(eq(RedeemCodes.id, input.id), eq(RedeemCodeGroups.userId, context.session.userId)))
        .then(useFirstRowOrThrow(new NotFoundError()));

      if (code.state === 'USED') {
        throw new IntentionalError('이미 사용된 코드에요');
      }

      return await database.transaction(async (tx) => {
        const redeemCode = await database
          .update(RedeemCodes)
          .set({ state: 'REVOKED' })
          .where(eq(RedeemCodes.id, code.id))
          .returning()
          .then(useFirstRowOrThrow());

        await checkRedeemCodeGroupState(redeemCode.groupId, tx);

        return redeemCode;
      });
    },
  }),

  registerRedeemCode: t.withAuth({ user: true }).field({
    type: RedeemCodeRedemption,
    args: { input: t.arg({ type: RegisterRedeemCodeInput }) },
    resolve: async (_, { input }, context) => {
      const retries = Number(await redis.get(`Redeem:retries:${context.session.userId}`));

      if (retries >= 10) {
        await R.sleep(R.random(1000, 3000));
        throw new IntentionalError('오류 횟수를 초과했어요. 잠시 뒤 다시 시도해주세요');
      }

      const redeem = await database
        .select({
          id: RedeemCodes.id,
          userId: RedeemCodeGroups.userId,
          groupId: RedeemCodes.groupId,
          postId: RedeemCodeGroups.postId,
        })
        .from(RedeemCodes)
        .innerJoin(RedeemCodeGroups, eq(RedeemCodes.groupId, RedeemCodeGroups.id))
        .where(
          and(
            eq(RedeemCodes.code, input.code.toUpperCase().replaceAll(/[^\dA-Z]/g, '')),
            eq(RedeemCodes.state, 'AVAILABLE'),
            gte(RedeemCodeGroups.expiresAt, dayjs()),
          ),
        )
        .then(useFirstRow);

      if (!redeem) {
        await redis.incr(`Redeem:retries:${context.session.userId}`);
        await redis.expire(`Redeem:retries:${context.session.userId}`, 60 * 60);
        await R.sleep(R.random(1000, 3000));
        throw new IntentionalError('유효하지 않은 코드에요');
      }

      if (redeem.userId === context.session.userId) {
        throw new IntentionalError('자신이 발급한 코드는 등록할 수 없어요');
      }

      const post = await database
        .select({
          spaceId: Posts.spaceId,
          publishedRevisionId: Posts.publishedRevisionId,
          purchaseId: PostPurchases.id,
        })
        .from(Posts)
        .leftJoin(
          PostPurchases,
          and(eq(PostPurchases.postId, Posts.id), eq(PostPurchases.userId, context.session.userId)),
        )
        .where(and(eq(Posts.id, redeem.postId), eq(Posts.state, 'PUBLISHED')))
        .then(useFirstRowOrThrow(new IntentionalError('포스트를 찾을 수 없어요')));

      if (post.purchaseId) {
        throw new IntentionalError('이미 구매한 포스트에요');
      }

      if (await getSpaceMember(context, post.spaceId)) {
        throw new IntentionalError('소속된 스페이스의 포스트는 구매할 수 없어요');
      }

      return await database.transaction(async (tx) => {
        const postPurchase = await tx
          .insert(PostPurchases)
          .values({
            userId: context.session.userId,
            postId: redeem.postId,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            revisionId: post.publishedRevisionId!,
          })
          .returning({ id: PostPurchases.id })
          .then(useFirstRowOrThrow());

        await tx.update(RedeemCodes).set({ state: 'USED' }).where(eq(RedeemCodes.id, redeem.id));

        await checkRedeemCodeGroupState(redeem.groupId, tx);

        return await tx
          .insert(RedeemCodeRedemptions)
          .values({
            codeId: redeem.id,
            purchaseId: postPurchase.id,
          })
          .returning()
          .then(useFirstRowOrThrow());
      });
    },
  }),
}));
