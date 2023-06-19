import Mixpanel from 'mixpanel';
import UAParser from 'ua-parser-js';
import { MIXPANEL_TOKEN } from '$env/static/private';
import { production } from '$lib/environment';
import type { RequestEvent } from '@sveltejs/kit';

export const mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

export const track = (
  event: RequestEvent,
  eventName: string,
  properties?: Record<string, unknown>
) => {
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
