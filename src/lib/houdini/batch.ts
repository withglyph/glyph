import { clientStarted, DataSource } from '$houdini';
import { delay } from '$lib/utils';
import type { ClientPlugin } from '$houdini';

type BatchPayload = {
  url: string;
  fetch: typeof globalThis.fetch;
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
};

const requestQueue: BatchPayload[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let requestPromise: Promise<any> | null = null;

const doRequest = async () => {
  await delay(20);

  if (requestQueue.length === 0) {
    return [];
  }

  const requests = requestQueue.splice(0, requestQueue.length);

  const resp = await requests[0].fetch(requests[0].url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      requests.map(({ operationName, query, variables }) => ({
        operationName,
        query,
        variables,
      }))
    ),
  });

  return await resp.json();
};

const request = async (payload: BatchPayload) => {
  console.log(payload.operationName);

  const seq = requestQueue.push(payload) - 1;

  if (requestPromise === null) {
    console.log('initialize dorequest');
    requestPromise = doRequest();
  }

  const results = await requestPromise;
  requestPromise = null;

  return results[seq];
};

export const batch: ClientPlugin = () => {
  return {
    async network(ctx, { client, resolve, next, marshalVariables }) {
      // query만 batch 할 수 있음 / SSR과 hydration할때는 배치하지 않음
      if (ctx.artifact.kind !== 'HoudiniQuery' || !clientStarted) {
        next(ctx);
        return;
      }

      const result = await request({
        url: client.url,
        fetch: ctx.fetch ?? globalThis.fetch,
        operationName: ctx.artifact.name,
        query: ctx.text,
        variables: marshalVariables(ctx),
      });

      resolve(ctx, {
        fetching: false,
        variables: ctx.variables ?? {},
        data: result.data,
        errors:
          !result.errors || result.errors.length === 0 ? null : result.errors,
        partial: false,
        stale: false,
        source: DataSource.Network,
      });
    },
  };
};
