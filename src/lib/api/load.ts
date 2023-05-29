import { derived, writable } from 'svelte/store';
import { createTRPCClient } from './client';
import type { TRPCClient } from './client';
import type { Writable } from 'svelte/store';

type Loader<T> = (t: TRPCClient) => Promise<T>;
type Writer<T> = {
  loader: Loader<T>;
  store: Writable<T>;
};

const writers: Writer<unknown>[] = [];

export const load = <T>(loader: Loader<T>) => {
  const store = writable<T>();
  writers.push({ loader, store });
  return derived(store, (value) => value);
};

export const loadAll = async (fetch: typeof globalThis.fetch) => {
  console.log('loadAll', writers.length);
  const trpc = createTRPCClient(fetch);
  await Promise.all(
    writers.map(async ({ loader, store }) => {
      store.set(await loader(trpc));
    })
  );
};
