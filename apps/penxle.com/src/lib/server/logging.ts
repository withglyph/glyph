import { stack } from '@penxle/lib/environment';
import winston from 'winston';
import { dev } from '$app/environment';

export const logger = winston.createLogger({
  level: dev ? 'error' : 'info',
  defaultMeta: { stack },
  transports: [new winston.transports.Console()],
});
