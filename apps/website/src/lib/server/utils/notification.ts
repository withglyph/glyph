import { and, eq } from 'drizzle-orm';
import * as R from 'radash';
import { UserNotificationCategory, UserNotificationMethod } from '$lib/enums';
import { database, inArray, UserNotificationPreferences, UserNotifications } from '../database';
import { firebase } from '../external-api';

type CheckNotificationPreferencesParams = {
  userId: string;
  category: keyof typeof UserNotificationCategory;
};

type CheckNotificationPreferencesResult = Record<keyof typeof UserNotificationMethod, boolean>;

export const checkNotificationPreferences = async ({
  userId,
  category,
}: CheckNotificationPreferencesParams): Promise<CheckNotificationPreferencesResult> => {
  const preferences = await database
    .select({
      category: UserNotificationPreferences.category,
      method: UserNotificationPreferences.method,
      opted: UserNotificationPreferences.opted,
    })
    .from(UserNotificationPreferences)
    .where(
      and(
        eq(UserNotificationPreferences.userId, userId),
        inArray(UserNotificationPreferences.category, [category, 'ALL']),
      ),
    );

  return R.zipToObject(
    Object.values(UserNotificationMethod),
    (method: keyof typeof UserNotificationMethod) =>
      preferences.find((preference) => preference.method === method && preference.category === category)?.opted ??
      preferences.find((preference) => preference.method === method && preference.category === 'ALL')?.opted ??
      true,
  );
};

type CreateNotificationParams = {
  userId: string;
  category: keyof typeof UserNotificationCategory;
  actorId: string;
  data: Record<string, unknown>;
  pushTitle: string;
  pushBody: string;
  pushPath?: string;
};

export const createNotification = async (params: CreateNotificationParams) => {
  const preferences = await checkNotificationPreferences({ userId: params.userId, category: params.category });

  if (preferences.WEBSITE) {
    await database.insert(UserNotifications).values({
      state: 'UNREAD',
      userId: params.userId,
      category: params.category,
      actorId: params.actorId,
      data: params.data,
    });

    await firebase.sendPushNotification({
      userId: params.userId,
      title: params.pushTitle,
      body: params.pushBody,
      path: params.pushPath,
    });
  }
};
