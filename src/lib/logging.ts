import pino from 'pino';
import { dev } from '$app/environment';

export const logger = pino({
  base: null,
  level: dev ? 'trace' : 'info',
});
