import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { formatAs } from './format-as';
import { kst } from './kst';

export const setupDayjs = () => {
  dayjs.extend(duration);
  dayjs.extend(timezone);
  dayjs.extend(utc);

  dayjs.extend(kst);
  dayjs.extend(formatAs);
};
