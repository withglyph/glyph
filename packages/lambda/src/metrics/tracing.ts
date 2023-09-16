import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import ddtrace from 'dd-trace';

export const tracer = ddtrace.init();
export const provider = new tracer.TracerProvider();

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [new PrismaInstrumentation()],
});

provider.register();
