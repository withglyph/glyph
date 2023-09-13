import { useOpenTelemetry } from '@envelop/opentelemetry';
import ddtrace from 'dd-trace';

const provider = new ddtrace.TracerProvider();
provider.register();

export const useTelemetry = () =>
  useOpenTelemetry(
    {
      resolvers: true,
      variables: true,
      result: true,
    },
    provider,
  );
