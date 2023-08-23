import './webhooks';

import { router } from '@penxle/lambda/http';
import { webhook } from './webhook';
import type { EmitterWebhookEventName } from '@octokit/webhooks';

router.post('/', async (request) => {
  const id = request.headers.get('x-github-delivery');
  const name = request.headers.get(
    'x-github-event',
  ) as EmitterWebhookEventName | null;
  const signature = request.headers.get('x-hub-signature-256');
  const payload = await request.text();

  if (!id || !name || !signature || !payload) {
    return {
      statusCode: 400,
      body: 'Invalid request',
    };
  }

  await webhook.verifyAndReceive({ id, name, signature, payload });

  return new Response('OK', { status: 200 });
});

export { handler } from '@penxle/lambda/http';
