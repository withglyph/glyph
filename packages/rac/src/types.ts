import type { SchemaTypes } from '@pothos/core';
import type { ImplementableLoadableObjectRef } from '@pothos/plugin-dataloader';

export type RequestData = {
  scopeCache: Record<string, Record<string, Record<string, boolean>>>;
};

export type LoadableResource<Types extends SchemaTypes> = ImplementableLoadableObjectRef<
  Types,
  Types,
  Types,
  string,
  string
>;

export type FullScope<Types extends SchemaTypes> = {
  scope: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resourceType: LoadableResource<Types> | any;
  resourceId: string;
};

export type Scope<Types extends SchemaTypes> = string | Pick<FullScope<Types>, 'scope'> | FullScope<Types>;

type OperatorSchema<Types extends SchemaTypes> = {
  operator: 'and' | 'or';
  operands: (OperatorSchema<Types> | Scope<Types>)[];
};

export type ScopeCondition<Types extends SchemaTypes> = Scope<Types> | OperatorSchema<Types> | undefined | false;

export type OperatorFn<Types extends SchemaTypes> = (...conditions: ScopeCondition<Types>[]) => ScopeCondition<Types>;
