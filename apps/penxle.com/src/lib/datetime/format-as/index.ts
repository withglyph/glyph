import type { PluginFunc } from 'dayjs';

export const formatAs: PluginFunc = (_, Dayjs) => {
  Dayjs.prototype.formatAsDate = function () {
    return this.format('YYYY. MM. DD');
  };

  Dayjs.prototype.formatAsDateTime = function () {
    return this.format('YYYY. MM. DD HH:mm');
  };

  Dayjs.prototype.formatAsTime = function () {
    return this.format('HH:mm');
  };
};
