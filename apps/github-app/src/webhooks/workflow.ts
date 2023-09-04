import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { webhook } from '../webhook';

const ECS = new ECSClient();

webhook.on('workflow_job.queued', async (event) => {
  if (!event.payload.workflow_job.labels.includes('node18/arm64')) {
    return;
  }

  await ECS.send(
    new RunTaskCommand({
      cluster: 'actions-runner',
      taskDefinition: 'actions-runner',
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: ['subnet-01ab476641b90df54', 'subnet-08d82c5d29f968d5a'],
          securityGroups: ['sg-00121fabce6dbddf8'],
          assignPublicIp: 'ENABLED',
        },
      },
    }),
  );
});
