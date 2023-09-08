import { makeErrorResult, makeResult } from '@urql/core';
import {
  makeFetchBody,
  makeFetchOptions,
  makeFetchURL,
} from '@urql/core/internal';
import { filter, fromPromise, merge, mergeMap, pipe, takeUntil } from 'wonka';
import type { Exchange } from '@urql/core';

export const fetchExchange: Exchange = ({ forward }) => {
  return (ops$) => {
    const fetchResults$ = pipe(
      ops$,
      filter((op) => op.kind !== 'teardown' && op.kind !== 'subscription'),
      mergeMap((op) => {
        const fetchOperation = async () => {
          let response;

          try {
            const url = makeFetchURL(op);
            const body = makeFetchBody(op);

            const fetch = op.context.fetch ?? globalThis.fetch;
            const fetchOptions = makeFetchOptions(op, body);

            response = await fetch(url, fetchOptions);

            const result = await response.json();
            return makeResult(op, result, response);
          } catch (err) {
            return err instanceof Error
              ? makeErrorResult(op, err, response)
              : makeErrorResult(op, new Error(String(err)), response);
          }
        };

        return pipe(
          fromPromise(fetchOperation()),
          takeUntil(
            pipe(
              ops$,
              filter((op) => op.kind === 'teardown' && op.key === op.key),
            ),
          ),
        );
      }),
    );

    const forward$ = pipe(
      ops$,
      filter((op) => op.kind === 'teardown' || op.kind === 'subscription'),
      forward,
    );

    return merge([fetchResults$, forward$]);
  };
};
