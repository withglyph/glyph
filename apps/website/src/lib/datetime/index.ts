import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import { formatAs } from './format-as';
import { kst } from './kst';

export const setupDayjs = () => {
  dayjs.extend(duration);
  dayjs.extend(timezone);
  dayjs.extend(utc);

  dayjs.extend(kst);
  dayjs.extend(formatAs);
  dayjs.extend(relativeTime);
  dayjs.extend(updateLocale);

  dayjs.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s 전',
      s: '%d초',
      m: '1분',
      mm: '%d분',
      h: '1시간',
      hh: '%d시간',
      d: '1일',
      dd: '%d일',
      M: '1개월',
      MM: '%d개월',
      y: '1년',
      yy: '%d년',
    },
  });
};
