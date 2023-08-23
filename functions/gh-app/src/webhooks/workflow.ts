import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { init } from '@paralleldrive/cuid2';
import { octokit, organization } from '../octokit';
import { webhook } from '../webhook';

const ECS = new ECSClient();
const createId = init({ length: 8 });

webhook.on('workflow_job.queued', async (event) => {
  const name = `${event.payload.repository.name}-${createId()}`;

  const { data: jitConfig } = await octokit.request(
    'POST /orgs/{org}/actions/runners/generate-jitconfig',
    {
      org: organization,
      name,
      labels: ['self-hosted', 'linux', 'arm64'],
      runner_group_id: 4, // penxle
    },
  );

  await ECS.send(
    new RunTaskCommand({
      cluster: 'penxle',
      taskDefinition: 'actions-runner',
      launchType: 'FARGATE',
      referenceId: name,
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
      overrides: {
        containerOverrides: [
          {
            name: 'actions-runner',
            environment: [
              {
                name: 'JIT_CONFIG',
                value: jitConfig.encoded_jit_config,
              },
            ],
          },
        ],
      },
    }),
  );
});
