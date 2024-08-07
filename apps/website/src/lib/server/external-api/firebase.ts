import { eq } from 'drizzle-orm';
import { applicationDefault, cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { database, UserPushNotificationTokens } from '../database';
import { finalizeResource, setResourceFinalizer } from '../utils';

await finalizeResource('firebase');

const app = initializeApp({
  credential: building ? applicationDefault() : cert(JSON.parse(env.PRIVATE_FIREBASE_SERVICE_ACCOUNT)),
});

setResourceFinalizer('firebase', async () => await deleteApp(app));

const messaging = getMessaging(app);

type SendPushNotificationParams = {
  userId: string;
  title: string;
  body: string;
  path?: string;
};
export const sendPushNotification = async ({ userId, title, body, path }: SendPushNotificationParams) => {
  const tokens = await database
    .select({ token: UserPushNotificationTokens.token })
    .from(UserPushNotificationTokens)
    .where(eq(UserPushNotificationTokens.userId, userId));

  if (tokens.length === 0) {
    return false;
  }

  const resp = await messaging.sendEachForMulticast({
    tokens: tokens.map(({ token }) => token),
    notification: {
      title,
      body,
    },
    data: {
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      ...(path && { path }),
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
    android: {
      notification: {
        defaultSound: true,
        defaultLightSettings: true,
        defaultVibrateTimings: true,
      },
    },
  });

  return resp.successCount > 0;
};
