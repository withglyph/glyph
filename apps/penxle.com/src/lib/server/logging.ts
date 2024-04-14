import { stack } from '@penxle/lib/environment';
import pino from 'pino';
import { dev } from '$app/environment';

export const logger = pino({
  level: process.env.SCRIPTS ? 'error' : dev ? 'trace' : 'info',
  base: {
    env: stack,
  },
});
