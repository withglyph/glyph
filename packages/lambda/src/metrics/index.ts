import { datadog } from 'datadog-lambda-js';
import ddtrace from 'dd-trace';

export const createHandler = (handler: unknown) => {
  if (process.env.DD_SITE) {
    return datadog(handler);
  }

  return handler;
};

export const tracer = ddtrace.init();
export const provider = new tracer.TracerProvider();
provider.register();
