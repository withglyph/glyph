import { status } from 'itty-router';
import { fromBase64 } from 'js-base64';
import { google } from '$lib/server/external-api';
import { createRouter } from '../router';

export const iap = createRouter();

iap.post('/iap/google', async (_, context) => {
  const payload = await context.event.request.json();
  const data = JSON.parse(fromBase64(payload.message.data));

  const resp = await google.getInAppPurchase({
    productId: data.oneTimeProductNotification.sku,
    token: data.oneTimeProductNotification.purchaseToken,
  });

  console.log(resp);

  return status(200);
});

iap.post('/iap/apple', async (_, context) => {
  const payload = await context.event.request.json();
  const jwt = fromBase64(payload.signedPayload);

  console.log(jwt);

  return status(200);
});
