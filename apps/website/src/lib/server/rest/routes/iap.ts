import { status } from 'itty-router';
import * as jose from 'jose';
import { fromBase64 } from 'js-base64';
import { google } from '$lib/server/external-api';
import { createRouter } from '../router';

export const iap = createRouter();

iap.post('/iap/google', async (_, context) => {
  const body = await context.event.request.json();
  const data = JSON.parse(fromBase64(body.message.data));

  const resp = await google.getInAppPurchase(
    // productId: data.oneTimeProductNotification.sku,
    data.oneTimeProductNotification.purchaseToken,
  );

  console.log(resp);

  return status(200);
});

iap.post('/iap/apple', async (_, context) => {
  const decodeJws = async (jws: string) => {
    const header = jose.decodeProtectedHeader(jws);

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const x509 = await jose.importX509(
      `-----BEGIN CERTIFICATE-----\n${header.x5c![0]}\n-----END CERTIFICATE-----`,
      header.alg!,
    );
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const { payload } = await jose.compactVerify(jws, x509);

    return JSON.parse(new TextDecoder().decode(payload));
  };

  const body = await context.event.request.json();
  const token = body.signedPayload;

  const payload = await decodeJws(token);

  console.log(payload);

  return status(200);
});
