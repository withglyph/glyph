import { isAsyncIterable } from '@envelop/core';
import * as Sentry from '@sentry/sveltekit';
import { GraphQLError } from 'graphql';
import { AppError, GraphQLAppError, UnknownError } from '$lib/errors';
import type {
  AsyncIterableIteratorOrValue,
  ExecutionResult,
} from '@envelop/core';
import type { Plugin } from 'graphql-yoga';
import type { Context } from '$lib/server/context';

const toGraphQLAppError = (error: unknown): GraphQLAppError => {
  if (error instanceof AppError) {
    return new GraphQLAppError(error);
  } else if (error instanceof GraphQLError && error.originalError) {
    return toGraphQLAppError(error.originalError);
  } else if (error instanceof Error) {
    console.error(error);
    Sentry.captureException(error);
    return new GraphQLAppError(new UnknownError(error));
  } else {
    console.error(error);
    Sentry.captureException(error);
    return new GraphQLAppError(new UnknownError());
  }
};

type ErrorHandlerPayload = { error: unknown; setError: (err: unknown) => void };
const errorHandler = ({ error, setError }: ErrorHandlerPayload) => {
  setError(toGraphQLAppError(error));
};

type ResultHandlerPayload<T> = { result: T; setResult: (result: T) => void };
const _resultHandler = ({
  result,
  setResult,
}: ResultHandlerPayload<ExecutionResult>) => {
  if (result.errors) {
    setResult({
      ...result,
      errors: result.errors.map((error) => toGraphQLAppError(error)),
    });
  }
};
const resultHandler = ({
  result,
  setResult,
}: ResultHandlerPayload<AsyncIterableIteratorOrValue<ExecutionResult>>) => {
  if (isAsyncIterable(result)) {
    return {
      onNext: _resultHandler,
    };
  } else {
    _resultHandler({ result, setResult });
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
