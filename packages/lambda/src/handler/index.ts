import { datadog } from 'datadog-lambda-js';

export const createHandler = <T>(handler: T) => datadog(handler) as T;
