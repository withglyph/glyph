import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { octokit, organization } from '../octokit';
import { webhook } from '../webhook';

const Lambda = new LambdaClient();

webhook.on('workflow_job.queued', async (event) => {
  const { data: registrationToken } = await octokit.request(
    'POST /orgs/{org}/actions/runners/registration-token',
    { org: organization },
  );

  const { data: removeToken } = await octokit.request(
    'POST /orgs/{org}/actions/runners/remove-token',
    { org: organization },
  );

  await Lambda.send(
    new InvokeCommand({
      FunctionName: 'actions-runner',
      InvocationType: 'Event',
      Payload: JSON.stringify({
        name: `${organization}-${event.payload.workflow_job.id}`,
        url: event.payload.repository.owner.html_url,
        tokens: {
          registration: registrationToken.token,
          remove: removeToken.token,
        },
      }),
    }),
  );
});
