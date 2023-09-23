import { useOpenTelemetry } from '@envelop/opentelemetry';
import { provider } from '@penxle/tracing';

export const useTelemetry = () => useOpenTelemetry({ resolvers: true, variables: true, result: true }, provider);
