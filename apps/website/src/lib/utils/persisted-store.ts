// original source from: https://github.com/joshnuss/svelte-persisted-store/
import { writable as internal } from 'svelte/store';
import { browser } from '$app/environment';
import type { Writable } from 'svelte/store';

declare type Updater<T> = (value: T) => T;
declare type StoreDict<T> = Record<string, Writable<T>>;

/* eslint-disable @typescript-eslint/no-explicit-any */
type Stores = {
  local: StoreDict<any>;
  session: StoreDict<any>;
};

const stores: Stores = {
  local: {},
  session: {},
};

export type Serializer<T> = {
  parse(text: string): T;
  stringify(object: T): string;
};

export type StorageType = 'local' | 'session';

export type Options<T> = {
  serializer?: Serializer<T>;
  storage?: StorageType;
  syncTabs?: boolean;
  onError?: (e: unknown) => void;
};

function getStorage(type: StorageType) {
  return type === 'local' ? localStorage : sessionStorage;
}

export function persisted<T>(key: string, initialValue: T, options?: Options<T>): Writable<T> {
  const serializer = options?.serializer ?? JSON;
  const storageType = options?.storage ?? 'local';
  const syncTabs = options?.syncTabs ?? true;
  const onError =
    options?.onError ??
    ((e) => console.error(`Error when writing value from persisted store "${key}" to ${storageType}`, e));
  const storage = browser ? getStorage(storageType) : null;

  function updateStorage(key: string, value: T) {
    try {
      storage?.setItem(key, serializer.stringify(value));
    } catch (err) {
      onError(err);
    }
  }

  function maybeLoadInitial(): T {
    const json = storage?.getItem(key);

    if (json) {
      return serializer.parse(json) as T;
    }

    return initialValue;
  }

  if (!stores[storageType][key]) {
    const initial = maybeLoadInitial();
    const store = internal(initial, (set) => {
      if (browser && storageType == 'local' && syncTabs) {
        const handleStorage = (event: StorageEvent) => {
          if (event.key === key) set(event.newValue ? serializer.parse(event.newValue) : null);
        };

        window.addEventListener('storage', handleStorage);

        return () => window.removeEventListener('storage', handleStorage);
      }
    });

    const { subscribe, set } = store;

    stores[storageType][key] = {
      set(value: T) {
        set(value);
        updateStorage(key, value);
      },
      update(callback: Updater<T>) {
        return store.update((last) => {
          const value = callback(last);

          updateStorage(key, value);

          return value;
        });
      },
      subscribe,
    };
  }

  return stores[storageType][key];
}
