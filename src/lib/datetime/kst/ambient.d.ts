declare module 'dayjs' {
  import type { ConfigType } from 'dayjs';

  export function kst(date?: ConfigType, format?: string): Dayjs;

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Dayjs {
    kst: (options?: { keepLocalTime: boolean }) => Dayjs;
  }
}

export {};
