import { expect, test } from 'vitest';
import { linkKey } from './const';
import { denormalize } from './denormalize';

test('denormalize scalars', () => {
  expect(denormalize(null, {}, new Set())).toEqual([null]);
  expect(denormalize({}, {}, new Set())).toEqual([{}]);
  expect(denormalize([], {}, new Set())).toEqual([[]]);
});

test('denormalize objects', () => {
  expect(
    denormalize(
      { [linkKey]: 'User:1' },
      { 'User:1': { __typename: 'User', id: '1', a: 1 } },
      new Set(['__typename', 'id', 'a']),
    ),
  ).toEqual([{ __typename: 'User', id: '1', a: 1 }]);
});

test('denormalize objects in array', () => {
  expect(
    denormalize(
      [{ [linkKey]: 'User:1' }, { [linkKey]: 'User:2' }],
      { 'User:1': { __typename: 'User', id: '1', a: 1 }, 'User:2': { __typename: 'User', id: '2', a: 2 } },
      new Set(['__typename', 'id', 'a']),
    ),
  ).toEqual([
    [
      { __typename: 'User', id: '1', a: 1 },
      { __typename: 'User', id: '2', a: 2 },
    ],
  ]);
});

test('denormalize nested objects', () => {
  expect(
    denormalize(
      { a: { [linkKey]: 'User:1' } },
      {
        'User:1': { __typename: 'User', id: '1', b: { c: { [linkKey]: 'User:2' } } },
        'User:2': { __typename: 'User', id: '2' },
      },
      new Set(['a', 'a.__typename', 'a.id', 'a.b', 'a.b.c', 'a.b.c.__typename', 'a.b.c.id']),
    ),
  ).toEqual([{ a: { __typename: 'User', id: '1', b: { c: { __typename: 'User', id: '2' } } } }]);
});

test('denormalize circular objects', () => {
  expect(
    denormalize(
      { [linkKey]: 'User:1' },
      { 'User:1': { __typename: 'User', id: '1', a: { [linkKey]: 'User:1' }, b: { [linkKey]: 'User:1' } } },
      new Set(['__typename', 'id', 'a', 'a.__typename', 'a.id', 'a.b', 'a.b.__typename', 'a.b.id']),
    ),
  ).toEqual([{ __typename: 'User', id: '1', a: { __typename: 'User', id: '1', b: { __typename: 'User', id: '1' } } }]);
});

test('denormalize circular objects 2', () => {
  expect(
    denormalize(
      { [linkKey]: 'User:1' },
      {
        'User:1': { __typename: 'User', id: '1', a: { [linkKey]: 'User:1' }, b: { [linkKey]: 'User:2' } },
        'User:2': { __typename: 'User', id: '2' },
      },
      new Set(['__typename', 'id', 'a', 'a.__typename', 'a.id', 'a.b', 'a.b.__typename', 'a.b.id']),
    ),
  ).toEqual([{ __typename: 'User', id: '1', a: { __typename: 'User', id: '1', b: { __typename: 'User', id: '2' } } }]);
});
