import { eq } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { database, PostComments, PostRevisions, Posts, Profiles, Spaces, UserNotifications } from '../database';
import { firebase } from '../external-api';
import { checkNotificationPreferences, useFirstRowOrThrow } from '../utils';
import { defineJob } from './types';
import type { Notification } from '$lib/utils';

type CreateNotificationParams = Notification & {
  origin: string;
};

export const createNotificationJob = defineJob('createNotification', async (params: CreateNotificationParams) => {
  const { userId, category, actorId, data } = params;
  const preferences = await checkNotificationPreferences({ userId, category });

  if (preferences.WEBSITE) {
    await database.insert(UserNotifications).values({
      userId,
      category,
      actorId,
      data,
      state: 'UNREAD',
    });
  }

  const actorProfile = await database
    .select()
    .from(Profiles)
    .where(eq(Profiles.id, actorId))
    .then(useFirstRowOrThrow());

  await firebase.sendPushNotification({
    userId,
    ...(await match(params)
      .with({ category: 'COMMENT' }, async ({ data }) => {
        const notificationData = await database
          .select({ postTitle: PostRevisions.title, commentContent: PostComments.content })
          .from(PostComments)
          .innerJoin(Posts, eq(PostComments.postId, Posts.id))
          .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
          .where(eq(PostComments.id, data.commentId))
          .then(useFirstRowOrThrow());

        return {
          title: notificationData.postTitle ?? '(제목 없음)',
          body: `${actorProfile.name}님이 "${notificationData.commentContent}" 댓글을 남겼어요.`,
        };
      })
      .with({ category: 'EMOJI_REACTION' }, async ({ data }) => {
        const notificationData = await database
          .select({ postTitle: PostRevisions.title })
          .from(Posts)
          .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
          .where(eq(Posts.id, data.postId))
          .then(useFirstRowOrThrow());

        return {
          title: notificationData.postTitle ?? '(제목 없음)',
          body: `${actorProfile.name}님이 이모지를 남겼어요.`,
        };
      })
      .with({ category: 'PURCHASE' }, async ({ data }) => {
        const notificationData = await database
          .select({ postTitle: PostRevisions.title })
          .from(Posts)
          .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
          .where(eq(Posts.id, data.postId))
          .then(useFirstRowOrThrow());

        return {
          title: notificationData.postTitle ?? '(제목 없음)',
          body: `${actorProfile.name}님이 포스트를 구매했어요.`,
        };
      })
      .with({ category: 'SUBSCRIBE' }, async ({ data }) => {
        const notificationData = await database
          .select({ spaceName: Spaces.name })
          .from(Spaces)
          .where(eq(Spaces.id, data.spaceId))
          .then(useFirstRowOrThrow());

        return {
          title: notificationData.spaceName,
          body: `${actorProfile.name}님이 스페이스를 구독했어요.`,
        };
      })
      .otherwise(() => {
        return {
          title: '알림이 도착했어요.',
          body: '앱에서 자세한 내용을 확인해보세요.',
        };
      })),
  });

  // 이메일 알림 일단 비활성화
  // if (preferences.EMAIL) {
  //   const user = await db.user.findUniqueOrThrow({
  //     where: { id: userId },
  //   });

  //   const actor = actorId
  //     ? await db.profile.findUniqueOrThrow({
  //         where: { id: actorId },
  //       })
  //     : null;

  //   switch (category) {
  //     case 'SUBSCRIBE': {
  //       const space = await db.space.findUniqueOrThrow({
  //         where: { id: data?.spaceId as string },
  //       });

  //       await sendEmail({
  //         subject: `[펜슬] ${actor?.name}님이 ${space.name} 스페이스를 관심 추가했어요`,
  //         recipient: user.email,
  //         template: Subscribe,
  //         props: {
  //           profileName: actor?.name as string,
  //           spaceName: space.name as string,
  //           spaceURL: `${origin}/${space.slug}`,
  //         },
  //       });
  //       break;
  //     }
  //     case 'PURCHASE': {
  //       const post = await db.post.findUniqueOrThrow({
  //         where: { id: data?.postId as string },
  //         include: { publishedRevision: true },
  //       });

  //       await sendEmail({
  //         subject: `[펜슬] ${actor?.name}님이 ${post.publishedRevision?.title} 포스트를 구매했어요`,
  //         recipient: user.email,
  //         template: Purchase,
  //         props: {
  //           profileName: actor?.name as string,
  //           postTitle: post.publishedRevision?.title as string,
  //           postURL: `https://pnxl.me/${BigInt(post.permalink).toString(36)}`,
  //         },
  //       });
  //     }
  //   }
  // }
});
