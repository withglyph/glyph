import { deepMerge, isArray, isKeyable, isObject, makeKey, makeLink } from './utils';
import type { Key, Keyable, NormalizedResult } from './types';

type StackItem =
  | { value: unknown; path: string; key: string | number; parent: Record<string | number, unknown> }
  | { value: unknown; path: string; key: number; parent: unknown[] };

export const normalize = (data: unknown): NormalizedResult => {
  const normalized = { data };
  const dependencies: Record<Key, Keyable> = {};

  const selections = new Set<string>();

  const stack: StackItem[] = [{ key: 'data', value: data, parent: normalized, path: '' }];
  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = stack.pop()!;

    if (isArray(item.value)) {
      const value = [...item.value];
      item.parent[item.key as never] = value;
      for (let i = 0; i < value.length; i++) {
        stack.push({ key: i, value: value[i], parent: value, path: item.path });
      }
    } else if (isObject(item.value)) {
      const value = { ...item.value };

      if (isKeyable(value)) {
        const k = makeKey(value);
        item.parent[item.key as never] = makeLink(k);

        dependencies[k] = dependencies[k] ? deepMerge(dependencies[k], value) : value;
        for (const key in value) {
          stack.push({
            key,
            value: value[key],
            parent: dependencies[k],
            path: item.path === '' ? key : `${item.path}.${key}`,
          });
        }
      } else {
        item.parent[item.key as never] = value;

        for (const key in value) {
          stack.push({ key, value: value[key], parent: value, path: item.path === '' ? key : `${item.path}.${key}` });
        }
      }
    }

    if (item.path !== '') {
      selections.add(item.path);
    }
  }

  return [normalized.data, dependencies, selections];
};
