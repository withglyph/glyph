import { datadog } from 'datadog-lambda-js';
import ddtrace from 'dd-trace';

export const createHandler = (handler: unknown) => {
  if (process.env.DD_SITE) {
    ddtrace.init();
    return datadog(handler);
  }

  return handler;
};

export { default as tracer } from 'dd-trace';
