import { isAsyncIterable } from '@envelop/core';
import { GraphQLError } from 'graphql';
import { AppError, UnknownError } from '$lib/errors';
import type { AsyncIterableIteratorOrValue, ExecutionResult } from '@envelop/core';
import type { Plugin } from 'graphql-yoga';
import type { PortableAppError } from '$lib/errors';
import type { Context } from '$lib/server/context';

class GraphQLAppError extends GraphQLError implements PortableAppError {
  public override readonly extensions: PortableAppError['extensions'];

  constructor(error: AppError) {
    const err = error.serialize();

    super(err.message);

    this.name = 'GraphQLAppError';
    this.extensions = err.extensions;
  }
}

const toGraphQLAppError = (error: unknown): GraphQLAppError => {
  if (error instanceof AppError) {
    return new GraphQLAppError(error);
  } else if (error instanceof GraphQLError && error.originalError) {
    return toGraphQLAppError(error.originalError);
  } else {
    return toGraphQLAppError(new UnknownError(error));
  }
};

type ErrorHandlerPayload = { error: unknown; setError: (err: unknown) => void };
const errorHandler = ({ error, setError }: ErrorHandlerPayload) => {
  setError(toGraphQLAppError(error));
};

type ResultHandlerPayload<T> = { result: T; setResult: (result: T) => void };
const resultHandler = ({ result, setResult }: ResultHandlerPayload<AsyncIterableIteratorOrValue<ExecutionResult>>) => {
  const handler = ({ result, setResult }: ResultHandlerPayload<ExecutionResult>) => {
    if (result.errors) {
      setResult({
        ...result,
        errors: result.errors.map((error) => toGraphQLAppError(error)),
      });
    }
  };

  if (isAsyncIterable(result)) {
    return { onNext: handler };
  } else {
    handler({ result, setResult });
    return;
  }
};

export const useErrorHandling = (): Plugin<Context> => {
  return {
    onPluginInit: ({ registerContextErrorHandler }) => {
      registerContextErrorHandler(errorHandler);
    },
    onExecute: () => ({
      onExecuteDone: resultHandler,
    }),
    onSubscribe: () => ({
      onSubscribeResult: resultHandler,
      onSubscribeError: errorHandler,
    }),
  };
};
