import './webhooks';

import { webhook } from './webhook';
import type { EmitterWebhookEventName } from '@octokit/webhooks';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler = (async (event) => {
  const id = event.headers['x-github-delivery'];
  const name = event.headers['x-github-event'] as
    | EmitterWebhookEventName
    | undefined;
  const signature = event.headers['x-hub-signature-256'];
  const payload = event.body;

  if (!id || !name || !signature || !payload) {
    return {
      statusCode: 400,
      body: 'Invalid request',
    };
  }

  await webhook.verifyAndReceive({ id, name, signature, payload });

  return {
    statusCode: 200,
    body: 'OK',
  };
}) satisfies APIGatewayProxyHandlerV2;
