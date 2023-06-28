import Mixpanel from 'mixpanel';
import UAParser from 'ua-parser-js';
import { MIXPANEL_TOKEN } from '$env/static/private';
import { production } from '$lib/environment';
import { prismaClient } from './database';
import type { RequestEvent } from '@sveltejs/kit';

export const mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

export const track = (
  event: RequestEvent,
  eventName: string,
  properties: Record<string, unknown>
) => {
  if (!properties.$user_id) {
    throw new Error('$user_id is required');
  }

  if (!production) {
    return;
  }

  const parser = new UAParser(event.request.headers.get('user-agent')!);
  const { browser, device, os } = parser.getResult();

  mixpanel.track(eventName, {
    $browser: browser.name,
    $device: device.type,
    $os: os.name,
    ip: event.getClientAddress(),
    ...properties,
  });
};

export const updateUser = async (event: RequestEvent, userId: string) => {
  if (!production) {
    return;
  }

  const user = await prismaClient.user.findUniqueOrThrow({
    select: { email: true, createdAt: true },
    where: { id: userId },
  });

  mixpanel.people.set(userId, {
    $email: user.email,
    $created: user.createdAt.toISOString(),
    ip: event.getClientAddress(),
  });
};
