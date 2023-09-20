import { stack } from '@penxle/lib/environment';
import pino from 'pino';

export const logger = pino({
  level: 'info',
  base: {
    env: stack,
  },
});
