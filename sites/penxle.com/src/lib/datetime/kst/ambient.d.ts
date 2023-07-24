import type { ConfigType } from 'dayjs';

declare module 'dayjs' {
  export function kst(date?: ConfigType, format?: string): Dayjs;

  // eslint-disable-next-line typescript/consistent-type-definitions
  interface Dayjs {
    kst: (options?: { keepLocalTime: boolean }) => Dayjs;
  }
}
