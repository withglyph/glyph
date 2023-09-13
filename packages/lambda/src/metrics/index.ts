import ddtrace from 'dd-trace';

export const tracer = ddtrace.init();

export { datadog as withMetrics } from 'datadog-lambda-js';
