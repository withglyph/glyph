import { readable } from 'svelte/store';
import { denormalize } from './denormalize';
import { normalize } from './normalize';
import { deepMerge, makeQueryKey } from './utils';
import type { Readable } from 'svelte/store';
import type { Key, Keyable } from './types';

export class Cache {
  #queryStorage = new Map<string, [normalized: unknown, dependencyKeys: Key[], selections: Set<string>]>();
  #keyableStorage = new Map<Key, Keyable>();
  #dependencySubscriptions = new Map<Key, Set<() => void>>();

  readQuery<T>(queryName: string, variables: Record<string, unknown>): Readable<T> {
    const query = this.#queryStorage.get(makeQueryKey(queryName, variables));
    if (!query) {
      throw new Error(`Query not found: ${queryName}`);
    }

    const [normalized, dependencyKeys, selections] = query;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dependencies = Object.fromEntries(dependencyKeys.map((key) => [key, this.#keyableStorage.get(key)!]));
    const [denormalized] = denormalize(normalized, dependencies, selections);

    return readable(denormalized as T, (set) => {
      const refresh = () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const dependencies = Object.fromEntries(dependencyKeys.map((key) => [key, this.#keyableStorage.get(key)!]));
        const [denormalized] = denormalize(normalized, dependencies, selections);
        set(denormalized as T);
      };

      for (const key of dependencyKeys) {
        let subscriptions = this.#dependencySubscriptions.get(key);
        if (!subscriptions) {
          subscriptions = new Set();
          this.#dependencySubscriptions.set(key, subscriptions);
        }
        subscriptions.add(refresh);
      }

      return () => {
        for (const key of dependencyKeys) {
          const subscriptions = this.#dependencySubscriptions.get(key);
          if (subscriptions) {
            subscriptions.delete(refresh);
            if (subscriptions.size === 0) {
              this.#dependencySubscriptions.delete(key);
            }
          }
        }
      };
    });
  }

  writeQuery<T>(queryName: string, variables: Record<string, unknown>, data: T) {
    const [normalized, dependencies, selections] = normalize(data);

    this.#queryStorage.set(makeQueryKey(queryName, variables), [
      normalized,
      Object.keys(dependencies) as Key[],
      selections,
    ]);

    for (const [key, keyable] of Object.entries(dependencies)) {
      const v = this.#keyableStorage.get(key as Key);
      this.#keyableStorage.set(key as Key, v ? deepMerge(v, keyable) : keyable);
      for (const subscription of this.#dependencySubscriptions.get(key as Key) || []) {
        subscription();
      }
    }
  }

  writeMutation<T>(data: T) {
    const [, dependencies] = normalize(data);
    for (const [key, keyable] of Object.entries(dependencies)) {
      const v = this.#keyableStorage.get(key as Key);
      this.#keyableStorage.set(key as Key, v ? deepMerge(v, keyable) : keyable);
      for (const subscription of this.#dependencySubscriptions.get(key as Key) || []) {
        subscription();
      }
    }
  }
}

export const cache = new Cache();
