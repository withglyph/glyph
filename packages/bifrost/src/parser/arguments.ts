import type graphql from 'graphql';
import type { Argument, Value } from '../types';

const buildValue = (value: graphql.ValueNode): Value => {
  // eslint-disable-next-line unicorn/prefer-switch
  if (value.kind === 'Variable') {
    return { kind: 'Variable', name: value.name.value };
  } else if (value.kind === 'ListValue') {
    return { kind: 'List', values: value.values.map((v) => buildValue(v)) };
  } else if (value.kind === 'ObjectValue') {
    return { kind: 'Object', fields: value.fields.map((f) => ({ name: f.name.value, value: buildValue(f.value) })) };
  } else if (value.kind === 'NullValue') {
    return { kind: 'Scalar', value: null };
  } else {
    return { kind: 'Scalar', value: value.value };
  }
};

export const buildArguments = (_arguments: readonly graphql.ArgumentNode[] | undefined): Argument[] => {
  return _arguments?.map(({ name, value }) => ({ name: name.value, value: buildValue(value) })) ?? [];
};
