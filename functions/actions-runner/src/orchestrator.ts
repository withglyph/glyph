import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { Webhooks } from '@octokit/webhooks';
import type { EmitterWebhookEventName } from '@octokit/webhooks';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

const Lambda = new LambdaClient();
const webhooks = new Webhooks({ secret: '1234' });

webhooks.on('workflow_job.queued', async () => {
  await Lambda.send(
    new InvokeCommand({
      FunctionName: 'actions-runner',
      InvocationType: 'Event',
    }),
  );
});

export const handler = (async (event) => {
  await webhooks.verifyAndReceive({
    id: event.headers['x-github-delivery'] ?? '',
    name: event.headers['x-github-event'] as EmitterWebhookEventName,
    signature: event.headers['x-hub-signature-256'] ?? '',
    payload: event.body ?? '',
  });

  return {};
}) satisfies APIGatewayProxyHandlerV2;
