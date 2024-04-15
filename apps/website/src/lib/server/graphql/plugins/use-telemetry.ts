import { trace } from '@opentelemetry/api';
import { AttributeNames, SpanNames } from '@pothos/tracing-opentelemetry';
import { print } from 'graphql';
import type { Plugin } from 'graphql-yoga';
import type { Context } from '$lib/server/context';

const tracer = trace.getTracer('graphql');

export const useTelemetry = (): Plugin<Context> => ({
  onExecute: ({ executeFn, setExecuteFn }) => {
    setExecuteFn((options) =>
      tracer.startActiveSpan(
        SpanNames.EXECUTE,
        {
          attributes: {
            [AttributeNames.OPERATION_NAME]: options.operationName ?? undefined,
            [AttributeNames.SOURCE]: print(options.document),
          },
        },
        async (span) => {
          try {
            return await executeFn(options);
          } catch (err) {
            span.recordException(err as Error);
            throw err;
          } finally {
            span.end();
          }
        },
      ),
    );
  },
});
