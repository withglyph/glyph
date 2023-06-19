import Mixpanel from 'mixpanel';
import UAParser from 'ua-parser-js';
import { CDN_URL, MIXPANEL_TOKEN } from '$env/static/private';
import { production } from '$lib/environment';
import { db } from './database';
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
    ip: event.getClientAddress(),
    $browser: browser.name,
    $device: device.type,
    $os: os.name,
    ...properties,
  });
};

export const updateUser = async (userId: string) => {
  const user = await db.user.findUniqueOrThrow({
    select: {
      email: true,
      createdAt: true,
      profiles: {
        select: {
          name: true,
          handle: true,
          avatar: { select: { path: true } },
        },
        where: { order: 0 },
      },
    },
    where: { id: userId },
  });

  const [profile] = user.profiles;

  mixpanel.people.set(userId, {
    $avatar: profile.avatar
      ? `${CDN_URL}/${profile.avatar.path}/full`
      : undefined,
    $email: user.email,
    $name: profile.name,
    $created: user.createdAt.toISOString(),
    handle: `@${profile.handle}`,
  });
};
