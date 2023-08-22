import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { octokit, organization } from '../octokit';
import { webhook } from '../webhook';

const ECS = new ECSClient();

webhook.on('workflow_job.queued', async (event) => {
  const { data: registrationToken } = await octokit.request(
    'POST /orgs/{org}/actions/runners/registration-token',
    { org: organization },
  );

  const { data: removeToken } = await octokit.request(
    'POST /orgs/{org}/actions/runners/remove-token',
    { org: organization },
  );

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
      overrides: {
        containerOverrides: [
          {
            name: 'actions-runner',
            environment: [
              {
                name: 'RUNNER_OPT',
                value: JSON.stringify({
                  name: `${organization}-${event.payload.workflow_job.id}`,
                  url: event.payload.repository.owner.html_url,
                  tokens: {
                    registration: registrationToken.token,
                    remove: removeToken.token,
                  },
                }),
              },
            ],
          },
        ],
      },
    }),
  );
});
