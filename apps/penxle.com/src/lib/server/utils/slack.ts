import got from 'got';
import { match } from 'ts-pattern';

type SlackChannel = 'settle';

export const logToSlack = (channel: SlackChannel, message: unknown) => {
  try {
    got({
      url: match(channel)
        .with('settle', () => process.env.PRIVATE_SLACK_SETTLE_WEBHOOK_URL)
        .exhaustive(),
      method: 'POST',
      json: message,
    });
  } catch {
    /* empty */
  }
};
