import { isArray, isLink, isObject, resolveLink } from './utils';
import type { DenormalizedResult, Key, Keyable } from './types';

type StackItem =
  | { value: unknown; path: string; key: string | number; parent: Record<string | number, unknown> }
  | { value: unknown; path: string; key: number; parent: unknown[] };

export const denormalize = (
  data: unknown,
  dependencies: Record<Key, Keyable>,
  selections: Set<string>,
): DenormalizedResult => {
  const denormalized = { data };

  const stack: StackItem[] = [{ key: 'data', value: data, parent: denormalized, path: '' }];
  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = stack.pop()!;

    if (item.path !== '' && !selections.has(item.path)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete item.parent[item.key as never];
      continue;
    }

    if (isArray(item.value)) {
      const value = [...item.value];
      item.parent[item.key as never] = value;
      for (let i = 0; i < value.length; i++) {
        stack.push({ key: i, value: value[i], parent: value, path: item.path });
      }
    } else if (isObject(item.value)) {
      if (isLink(item.value)) {
        const k = resolveLink(item.value);
        const value = { ...dependencies[k] };

        item.parent[item.key as never] = value;

        for (const key in value) {
          stack.push({
            key,
            value: value[key],
            parent: value,
            path: item.path === '' ? key : `${item.path}.${key}`,
          });
        }
      } else {
        const value = { ...item.value };
        item.parent[item.key as never] = value;

        for (const key in value) {
          stack.push({ key, value: value[key], parent: value, path: item.path === '' ? key : `${item.path}.${key}` });
        }
      }
    }
  }

  return [denormalized.data];
};
