/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */
import type { FieldNullability, InputFieldMap, MaybePromise, SchemaTypes, TypeParam } from '@pothos/core';
import type { PothosRACPlugin } from '.';
import type { OperatorFn, ScopeCondition } from './types';

declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      rac: PothosRACPlugin<Types>;
    }

    export interface SchemaBuilderOptions<Types extends SchemaTypes> {
      racPluginOptions?: {
        permissionDeniedError?: () => Error;
      };
    }

    export interface ObjectTypeOptions<Types extends SchemaTypes, Shape> {
      roleGranter?: Record<string, (data: Shape, context: Types['Context']) => MaybePromise<boolean>>;
    }

    export interface ObjectFieldOptions<
      Types extends SchemaTypes,
      ParentShape,
      Type extends TypeParam<Types>,
      Nullable extends FieldNullability<Type>,
      Args extends InputFieldMap,
      ResolveReturnShape,
    > {
      scopes?:
        | ScopeCondition<Types>
        | ((
            scopeFn: { and: OperatorFn<Types>; or: OperatorFn<Types> },
            data: ParentShape,
            context: Types['Context'],
          ) => MaybePromise<ScopeCondition<Types>>);

      scopeError?: (data: ParentShape, args: Args, context: Types['Context']) => MaybePromise<unknown>;
    }
  }
}
