import { get, writable as _writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { StartStopNotifier, Writable } from 'svelte/store';

const stores = new WeakMap<symbol, Map<symbol, Writable<unknown>>>();
const factories = new Map<symbol, () => Writable<unknown>>();

const createOrRetrieve = <T>(key: symbol) => {
  const p = get(page);

  let scopedStores = stores.get(p);
  if (!scopedStores) {
    scopedStores = new Map();
    stores.set(p, scopedStores);
  }

  let store = scopedStores.get(key);
  if (!store) {
    store = factories.get(key)!();
    scopedStores.set(key, store);
  }

  return store as Writable<T>;
};

export const writable = <T>(
  value?: T,
  start?: StartStopNotifier<T>
): Writable<T> => {
  if (browser) {
    return _writable(value);
  }

  const key = Symbol();
  factories.set(key, () => _writable(value, start));

  return {
    subscribe: (run, invalidate) =>
      createOrRetrieve<T>(key).subscribe(run, invalidate),
    set: (value) => createOrRetrieve<T>(key).set(value),
    update: (updater) => createOrRetrieve<T>(key).update(updater),
  };
};
