import { useOpenTelemetry } from '@envelop/opentelemetry';
import { tracer } from '@penxle/lambda/metrics';

const provider = new tracer.TracerProvider();
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
