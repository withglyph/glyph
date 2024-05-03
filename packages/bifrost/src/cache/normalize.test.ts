import { expect, test } from 'vitest';
import { linkKey } from './const';
import { normalize } from './normalize';

test('normalize scalars', () => {
  expect(normalize(null)).toEqual([null, {}, new Set([])]);
  expect(normalize({})).toEqual([{}, {}, new Set([])]);
  expect(normalize([])).toEqual([[], {}, new Set([])]);
});

test('normalize objects', () => {
  expect(normalize({ __typename: 'User', id: '1', a: 1 })).toEqual([
    { [linkKey]: 'User:1' },
    { 'User:1': { __typename: 'User', id: '1', a: 1 } },
    new Set(['__typename', 'id', 'a']),
  ]);
});

test('normalize objects in array', () => {
  expect(
    normalize([
      { __typename: 'User', id: '1', a: 1 },
      { __typename: 'User', id: '2', a: 2 },
    ]),
  ).toEqual([
    [{ [linkKey]: 'User:1' }, { [linkKey]: 'User:2' }],
    { 'User:1': { __typename: 'User', id: '1', a: 1 }, 'User:2': { __typename: 'User', id: '2', a: 2 } },
    new Set(['__typename', 'id', 'a']),
  ]);
});

test('normalize nested objects', () => {
  expect(normalize({ a: { __typename: 'User', id: '1', b: { c: { __typename: 'User', id: '2' } } } })).toEqual([
    { a: { [linkKey]: 'User:1' } },
    {
      'User:1': { __typename: 'User', id: '1', b: { c: { [linkKey]: 'User:2' } } },
      'User:2': { __typename: 'User', id: '2' },
    },
    new Set(['a', 'a.__typename', 'a.id', 'a.b', 'a.b.c', 'a.b.c.__typename', 'a.b.c.id']),
  ]);
});

test('normalize circular objects', () => {
  expect(
    normalize({ __typename: 'User', id: '1', a: { __typename: 'User', id: '1', b: { __typename: 'User', id: '1' } } }),
  ).toEqual([
    { [linkKey]: 'User:1' },
    { 'User:1': { __typename: 'User', id: '1', a: { [linkKey]: 'User:1' }, b: { [linkKey]: 'User:1' } } },
    new Set(['__typename', 'id', 'a', 'a.__typename', 'a.id', 'a.b', 'a.b.__typename', 'a.b.id']),
  ]);
});

test('normalize circular objects 2', () => {
  expect(
    normalize({ __typename: 'User', id: '1', a: { __typename: 'User', id: '1', b: { __typename: 'User', id: '2' } } }),
  ).toEqual([
    { [linkKey]: 'User:1' },
    {
      'User:1': { __typename: 'User', id: '1', a: { [linkKey]: 'User:1' }, b: { [linkKey]: 'User:2' } },
      'User:2': { __typename: 'User', id: '2' },
    },
    new Set(['__typename', 'id', 'a', 'a.__typename', 'a.id', 'a.b', 'a.b.__typename', 'a.b.id']),
  ]);
});
