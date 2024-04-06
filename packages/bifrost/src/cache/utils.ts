import deepmerge from 'deepmerge';
import stringify from 'fast-json-stable-stringify';
import { linkKey } from './const';
import type { Key, Keyable, Link, VisitParams } from './types';

export const makeKey = (keyable: Keyable): Key => {
  return `${keyable.__typename}:${keyable.id}`;
};

export const isKeyable = (data: unknown): data is Keyable => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    '__typename' in data &&
    typeof data.id === 'string' &&
    typeof data.__typename === 'string'
  );
};

export const isLink = (data: unknown): data is Link => {
  return typeof data === 'object' && data !== null && linkKey in data;
};

export const makeLink = (key: Key): Link => {
  return { [linkKey]: key };
};

export const resolveLink = (link: Link): Key => {
  return link[linkKey];
};

export const isObject = (data: unknown): data is Record<string | number | symbol, unknown> => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};

export const isArray = (data: unknown): data is unknown[] => {
  return Array.isArray(data);
};

export const deepMerge = <T>(target: Partial<T>, source: Partial<T>) => {
  return deepmerge(target, source, { clone: false, arrayMerge: (_, source) => source });
};

export const clone = <T>(data: T): T => {
  return deepmerge({}, data);
};

export const makeQueryKey = (operationName: string, variables: Record<string, unknown>) => {
  return `${operationName}(${stringify(variables)})`;
};

export const visit = (value: unknown, visitor: (params: VisitParams) => void) => {
  const walk = (value: unknown, parent: unknown | null, path: (string | number)[]) => {
    if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        walk(value[i], value, [...path, i]);
      }
    } else if (isObject(value)) {
      for (const key in value) {
        walk(value[key], value, [...path, key]);
      }
    }

    visitor({ key: path.at(-1) ?? null, value, parent, path });
  };

  walk(value, null, []);
};
