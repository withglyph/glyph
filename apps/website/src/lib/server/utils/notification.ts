import { and, eq } from 'drizzle-orm';
import * as R from 'radash';
import { UserNotificationCategory, UserNotificationMethod } from '$lib/enums';
import { database, inArray, UserNotificationPreferences } from '../database';

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
