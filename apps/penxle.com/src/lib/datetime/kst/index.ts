import type { PluginFunc } from 'dayjs';

export const kst: PluginFunc = (_, Dayjs, dayjs) => {
  dayjs.kst = (date, format) => {
    return format ? dayjs.tz(date, format, 'Asia/Seoul') : dayjs.tz(date, 'Asia/Seoul');
  };

  Dayjs.prototype.kst = function (options) {
    return this.tz('Asia/Seoul', options?.keepLocalTime);
  };
};
