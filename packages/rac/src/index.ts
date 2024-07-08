/* eslint-disable @typescript-eslint/no-unused-vars */
import './global-types';

import SchemaBuilder, { BasePlugin } from '@pothos/core';
import * as R from 'radash';
import type { InputFieldMap, MaybePromise, PothosOutputFieldConfig, PothosTypeConfig, SchemaTypes } from '@pothos/core';
import type { GraphQLFieldResolver } from 'graphql';
import type { LoadableResource, OperatorFn, RequestData, Scope, ScopeCondition } from './types';

const pluginName = 'rac';

// eslint-disable-next-line import/no-default-export
export default pluginName;

export class PothosRACPlugin<Types extends SchemaTypes> extends BasePlugin<Types, RequestData> {
  and: OperatorFn<Types> = (...conditions) => {
    const operands = R.sift(conditions);

    if (operands.length === 0) {
      return undefined;
    } else if (operands.length === 1) {
      return operands[0];
    }
    return {
      operator: 'and',
      operands,
    };
  };

  or: OperatorFn<Types> = (...conditions) => {
    const operands = R.sift(conditions);

    if (operands.length === 0) {
      return undefined;
    } else if (operands.length === 1) {
      return operands[0];
    }
    return {
      operator: 'or',
      operands,
    };
  };

  resolveScopeCondition = async (
    scope: Exclude<Scope<Types>, string>,
    context: Types['Context'],
    options: {
      typeName: string;
      object: unknown;
    },
  ): Promise<boolean> => {
    const { scopeCache } = this.requestData(context);
    const typeName = 'resourceType' in scope ? scope.resourceType.name : options.typeName;
    const objectId = 'resourceType' in scope ? scope.resourceId : (options.object as { id: string }).id;

    if (scopeCache?.[typeName]?.[objectId]?.[scope.scope] === undefined) {
      const roleGranter = this.roleGranters[typeName][scope.scope];

      if (typeof roleGranter === 'function') {
        if (scopeCache[typeName] === undefined) {
          scopeCache[typeName] = {};
        }
        if (scopeCache[typeName][objectId] === undefined) {
          scopeCache[typeName][objectId] = {};
        }

        if (typeName === options.typeName) {
          scopeCache[typeName][objectId][scope.scope] = await roleGranter(options.object, context);
        } else if ('resourceType' in scope) {
          const object = await scope.resourceType.getDataloader(context).load(scope.resourceId);
          scopeCache[typeName][objectId][scope.scope] = await roleGranter(object, context);
        } else {
          // Error case
          return false;
        }
      } else {
        return false;
      }
    }

    return scopeCache[typeName][objectId][scope.scope];
  };

  processScopeCondition = async (
    condition: ScopeCondition<Types>,
    context: Types['Context'],
    options: {
      typeName: string;
      object: unknown;
    },
  ): Promise<boolean> => {
    if (condition === undefined || condition === false) {
      return true;
    }

    if (typeof condition === 'string') {
      condition = { scope: condition };
    }
    if ('scope' in condition) {
      return this.resolveScopeCondition(condition, context, options);
    }

    return await Promise.all(
      condition.operands.map((operand) => this.processScopeCondition(operand, context, options)),
    ).then((results) => (condition.operator === 'and' ? results.every(Boolean) : results.some(Boolean)));
  };

  private roleGranters: Record<
    string,
    Record<string, (data: unknown, context: Types['Context']) => MaybePromise<boolean>>
  > = {};

  override createRequestData(context: Types['Context']): RequestData {
    return { scopeCache: {} };
  }

  override onTypeConfig(typeConfig: PothosTypeConfig): PothosTypeConfig {
    if ('roleGranter' in typeConfig.pothosOptions && typeConfig.pothosOptions.roleGranter) {
      this.roleGranters[typeConfig.name] = typeConfig.pothosOptions.roleGranter;
    }

    return typeConfig;
  }

  override wrapResolve(
    resolver: GraphQLFieldResolver<unknown, Types['Context'], object>,
    fieldConfig: PothosOutputFieldConfig<Types>,
  ): GraphQLFieldResolver<unknown, Types['Context'], object> {
    return async (parent, args, context, info) => {
      if ('scopes' in fieldConfig.pothosOptions && fieldConfig.pothosOptions.scopes) {
        const scopeCondition =
          fieldConfig.pothosOptions.scopes instanceof Function
            ? await fieldConfig.pothosOptions.scopes({ and: this.and, or: this.or }, parent, context)
            : fieldConfig.pothosOptions.scopes;

        if (scopeCondition) {
          const result = await this.processScopeCondition(scopeCondition, context, {
            typeName: fieldConfig.parentType,
            object: parent,
          });
          if (result === false) {
            if (typeof fieldConfig.pothosOptions.scopeError === 'function') {
              return fieldConfig.pothosOptions.scopeError(parent, args as InputFieldMap, context);
            } else {
              throw typeof this.builder.options.racPluginOptions?.permissionDeniedError === 'function'
                ? this.builder.options.racPluginOptions.permissionDeniedError()
                : new Error('Permission denied');
            }
          }
        }
      }

      return resolver(parent, args, context, info);
    };
  }
}

SchemaBuilder.registerPlugin(pluginName, PothosRACPlugin);
