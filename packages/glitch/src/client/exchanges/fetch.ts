import { makeErrorResult, makeResult } from '@urql/core';
import { makeFetchBody } from '@urql/core/internal';
import DataLoader from 'dataloader';
import { filter, fromPromise, merge, mergeMap, pipe, tap } from 'wonka';
import type { Exchange, Operation, OperationResult } from '@urql/core';

const createScheduler = () => {
  const callbacks: (() => void)[] = [];

  return {
    schedule: (cb: () => void) => callbacks.push(cb),
    dispatch: () => {
      while (callbacks.length > 0) {
        callbacks.shift()?.();
      }
    },
  };
};

export const fetchExchange: Exchange = ({ forward, dispatchDebug }) => {
  const { schedule, dispatch } = createScheduler();
  let isHydration = true;

  const dataLoader = new DataLoader<Operation, OperationResult>(
    async (operations) => {
      const fetch = operations[0].context.fetch ?? globalThis.fetch;
      const url = operations[0].context.url;
      const body = JSON.stringify(operations.map((operation) => makeFetchBody(operation)));

      const request: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      };

      for (const operation of operations) {
        dispatchDebug({
          type: 'fetchRequest',
          message: 'A fetch request is being executed.',
          operation,
          data: {
            url,
            fetchOptions: request,
          },
        });
      }

      let results: OperationResult[];
      try {
        const resp = await fetch(url, request);
        const payload = await resp.json();
        results = operations.map((operation, i) => makeResult(operation, payload[i]));
      } catch (err: unknown) {
        results = operations.map((operation) => makeErrorResult(operation, err as Error));
      }

      for (const result of results) {
        const error = result.data ? undefined : result.error;

        dispatchDebug({
          type: error ? 'fetchError' : 'fetchSuccess',
          message: `A ${error ? 'failed' : 'successful'} fetch response has been returned.`,
          operation: result.operation,
          data: {
            url,
            fetchOptions: request,
            value: error || result,
          },
        });
      }

      return results;
    },
    {
      batchScheduleFn: schedule,
      cache: false,
    },
  );

  return (ops$) => {
    const fetch$ = pipe(
      ops$,
      filter((operation) => operation.kind !== 'teardown'),
      tap((operation) =>
        dispatchDebug({
          type: 'dataloader',
          message: 'A fetch request is being queued for later execution.',
          operation,
        }),
      ),
      mergeMap((operation) => {
        const source = fromPromise(dataLoader.load(operation));
        if (isHydration) {
          dispatch();
        } else {
          setTimeout(dispatch, 10);
        }
        return source;
      }),
      tap(({ operation }) =>
        dispatchDebug({
          type: 'dataloader',
          message: 'Pending fetch requests has been fulfilled.',
          operation,
        }),
      ),
      tap(() => setTimeout(() => (isHydration = false), 1000)),
    );

    const forward$ = pipe(
      ops$,
      filter((operation) => operation.kind === 'teardown'),
      forward,
    );

    return merge([fetch$, forward$]);
  };
};
