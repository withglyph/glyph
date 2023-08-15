import Mixpanel from 'mixpanel';
import UAParser from 'ua-parser-js';
import { PRIVATE_MIXPANEL_TOKEN } from '$env/static/private';
import { production } from '$lib/environment';
import type { RequestEvent } from '@sveltejs/kit';
import type { InteractiveTransactionClient } from './database';

const mixpanel = Mixpanel.init(PRIVATE_MIXPANEL_TOKEN);

export const track = (
  event: RequestEvent,
  eventName: string,
  properties: Record<string, unknown>,
) => {
  if (!production) {
    return;
  }

  const ua = event.request.headers.get('user-agent');
  if (!ua) {
    mixpanel.track(eventName, {
      ip: event.getClientAddress(),
      ...properties,
    });
    return;
  }

  const parser = new UAParser(ua);
  const { browser, device, os } = parser.getResult();

  mixpanel.track(eventName, {
    $browser: browser.name,
    $device: device.type,
    $os: os.name,
    ip: event.getClientAddress(),
    ...properties,
  });
};

export const updateUser = async (
  db: InteractiveTransactionClient,
  event: RequestEvent,
  userId: string,
) => {
  if (!production) {
    return;
  }

  const user = await db.user.findUniqueOrThrow({
    select: { email: true, createdAt: true },
    where: { id: userId },
  });

  mixpanel.people.set(String(userId), {
    $email: user.email,
    $created: user.createdAt.toISOString(),
    ip: event.getClientAddress(),
  });
};
