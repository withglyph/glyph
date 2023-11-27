import { stack } from '@penxle/lib/environment';
import pino from 'pino';

export const logger = pino({
  level: 'trace',
  base: {
    env: stack,
  },
});
