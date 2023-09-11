import { makeSubject, pipe, publish, tap } from 'wonka';
import type { Exchange, Operation } from '@urql/core';

const { source, next } = makeSubject();

export const refetchExchange: Exchange =
  ({ client, forward }) =>
  (ops$) => {
    const watchedOperations = new Map<number, Operation>();

    pipe(
      source,
      tap(() => {
        for (const op of watchedOperations.values()) {
          client.reexecuteOperation(
            client.createRequestOperation('query', op, {
              ...op.context,
              requestPolicy: 'network-only',
            }),
          );
        }
      }),
      publish,
    );

    const pipe$ = pipe(
      ops$,
      tap((op) => {
        if (op.kind === 'query' && !watchedOperations.has(op.key)) {
          watchedOperations.set(op.key, op);
        }

        if (op.kind === 'teardown' && watchedOperations.has(op.key)) {
          watchedOperations.delete(op.key);
        }
      }),
    );

    return forward(pipe$);
  };

export const signalRefetch = () => {
  next(null);
};
