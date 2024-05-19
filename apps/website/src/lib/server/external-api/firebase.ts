import { eq } from 'drizzle-orm';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { env } from '$env/dynamic/private';
import { database, UserPushNotificationTokens } from '../database';
import { finalizeResource, setResourceFinalizer } from '../utils';

await finalizeResource('firebase');

const app = initializeApp({
  credential: cert(JSON.parse(env.PRIVATE_FIREBASE_SERVICE_ACCOUNT ?? '{}')),
});

setResourceFinalizer('firebase', async () => await deleteApp(app));

const messaging = getMessaging(app);

type SendPushNotificationParams = {
  userId: string;
  title: string;
  body: string;
};
export const sendPushNotification = async ({ userId, title, body }: SendPushNotificationParams) => {
  const tokens = await database
    .select({ token: UserPushNotificationTokens.token })
    .from(UserPushNotificationTokens)
    .where(eq(UserPushNotificationTokens.userId, userId));

  await messaging.sendEachForMulticast({
    tokens: tokens.map(({ token }) => token),
    notification: {
      title,
      body,
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
};
