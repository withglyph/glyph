import { Webhooks } from '@octokit/webhooks';
import { getEnv } from './env';

export const webhook = new Webhooks({
  secret: await getEnv('GH_APP_WEBHOOK_SECRET'),
});
