import { stack } from '@penxle/lib/environment';
import winston from 'winston';
import { dev } from '$app/environment';

export const logger = winston.createLogger({
  level: dev ? 'verbose' : 'info',
  defaultMeta: { stack },
  transports: [new winston.transports.Console()],
});
