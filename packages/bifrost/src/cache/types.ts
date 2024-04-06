import type { linkKey } from './const';

export type Typename = string;
export type ID = string;

export type QueryKey = string;
export type Key = `${Typename}:${ID}`;

export type Keyable = {
  [key: string]: unknown;
  __typename: Typename;
  id: ID;
};

export type Link = {
  [linkKey]: Key;
};

export type NormalizedResult = [normalized: unknown, dependencies: Record<Key, Keyable>, selections: Set<string>];
export type DenormalizedResult = [denormalized: unknown];

export type VisitParams = {
  key: string | number | symbol | null;
  value: unknown;
  parent: unknown | null;
  path: (string | number)[];
};
