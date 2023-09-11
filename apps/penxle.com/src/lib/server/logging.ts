import { stack } from '@penxle/lib/environment';
import winston from 'winston';
import { dev } from '$app/environment';

export const logger = winston.createLogger({
  level: dev ? 'info' : 'info',
  defaultMeta: { stack },
  transports: [new winston.transports.Console()],
});
