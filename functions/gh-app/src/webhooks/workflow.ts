import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { webhook } from '../webhook';

const ECS = new ECSClient();

webhook.on('workflow_job.queued', async () => {
  await ECS.send(
    new RunTaskCommand({
      cluster: 'penxle',
      taskDefinition: 'actions-runner',
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          subnets: [
            'subnet-0c0f1c2302a02567e', // public-az1
            'subnet-064f753d822401555', // public-az2
          ],
          securityGroups: [
            'sg-07b4d23e540b34d41', // private
          ],
        },
      },
    }),
  );
});
