import { createId } from '@felte/core';
import * as R from 'radash';
import { PrismaEnums } from '$prisma';
import type { Notification } from '$lib/utils';
import type { InteractiveTransactionClient } from '../prisma';

type PurchaseNotification = {
  category: 'PURCHASE';
  actorId: string;
  data: {
    postId: string;
  };
};

type SubscribeNotification = {
  category: 'SUBSCRIBE';
  actorId: string;
  data: {
    spaceId: string;
  };
};

export type Notification = (PurchaseNotification | SubscribeNotification) & {
  userId: string;
};

type CheckNotificationPreferencesParams = {
  db: InteractiveTransactionClient;
  userId: string;
  category: PrismaEnums.UserNotificationCategory;
};

type CheckNotificationPreferencesResult = Record<PrismaEnums.UserNotificationMethod, boolean>;

export const checkNotificationPreferences = async ({
  db,
  userId,
  category,
}: CheckNotificationPreferencesParams): Promise<CheckNotificationPreferencesResult> => {
  const preferences = await db.userNotificationPreference.findMany({
    where: {
      userId,
      category: {
        in: [category, 'ALL'],
      },
    },
  });

  return R.zipToObject(
    Object.keys(PrismaEnums.UserNotificationMethod) as PrismaEnums.UserNotificationMethod[],
    (method: PrismaEnums.UserNotificationMethod) =>
      preferences.find((preference) => preference.method === method && preference.category === category)?.opted ??
      preferences.find((preference) => preference.method === method && preference.category === 'ALL')?.opted ??
      true,
  );
};

type CreateNotificationParams = Notification & {
  db: InteractiveTransactionClient;
  origin: string;
};

export const createNotification = async ({ db, userId, category, actorId, data }: CreateNotificationParams) => {
  const preferences = await checkNotificationPreferences({ db, userId, category });

  if (preferences.WEBSITE) {
    await db.userNotification.create({
      data: {
        id: createId(),
        userId,
        category,
        actorId,
        data,
        state: 'UNREAD',
      },
    });
  }

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
};
