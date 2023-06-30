import dayjs from 'dayjs';
import type { Cookies, Handle } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import type { DurationUnitsObjectType } from 'dayjs/plugin/duration';

declare module '@sveltejs/kit' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface Cookies {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    set(name: string, value: string, opts?: SetCookieOptions): void;
  }
}

type SetCookieOptions = {
  duration?: DurationUnitsObjectType;
} & CookieSerializeOptions;

export const patch = (async ({ event, resolve }) => {
  event.cookies = new Proxy(event.cookies, {
    get(target, prop) {
      if (prop === 'set') {
        return (name: string, value: string, options?: SetCookieOptions) => {
          target.set(name, value, {
            maxAge:
              options?.maxAge ??
              dayjs.duration(options?.duration ?? { years: 1 }).asSeconds(),
            path: options?.path ?? '/',
          });
        };
      }

      if (prop === 'delete') {
        return (name: string, options?: CookieSerializeOptions) => {
          target.delete(name, { path: options?.path ?? '/' });
        };
      }

      return target[prop as keyof Cookies];
    },
  });

  return await resolve(event);
}) satisfies Handle;
