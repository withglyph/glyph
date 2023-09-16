import './tracing';

import { datadog } from 'datadog-lambda-js';

export const createHandler = (handler: unknown) => {
  if (process.env.DD_SITE) {
    return datadog(handler);
  }

  return handler;
};

export * from './tracing';
