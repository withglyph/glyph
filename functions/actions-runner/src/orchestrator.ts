import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { Webhooks } from '@octokit/webhooks';
import type { EmitterWebhookEventName } from '@octokit/webhooks';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

const ECS = new ECSClient();
const webhooks = new Webhooks({ secret: '1234' });

webhooks.on('workflow_job.queued', async () => {
  await ECS.send(
    new RunTaskCommand({
      cluster: 'penxle',
      taskDefinition: 'actions-runner',
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: ['subnet-024dd73d6018d2e39', 'subnet-09d82bf9e1fb6bdb6'],
          securityGroups: ['sg-07b4d23e540b34d41'],
        },
      },
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
