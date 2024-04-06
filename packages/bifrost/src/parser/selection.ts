import graphql from 'graphql';
import { match } from 'ts-pattern';
import { hasDirective, isListType, unwrapType } from '../utils';
import { buildArguments } from './arguments';
import type { FragmentArtifact, Selection } from '../types';

export const buildSelections = (
  schema: graphql.GraphQLSchema,
  parentType: graphql.GraphQLCompositeType,
  selectionSet: graphql.SelectionSetNode,
) => {
  const selections: Selection[] = [];

  for (const selection of selectionSet.selections) {
    // eslint-disable-next-line unicorn/prefer-switch
    if (selection.kind === 'Field') {
      if (selection.name.value === '__typename') {
        selections.push({
          kind: 'TypenameField',
          name: '__typename',
          alias: selection.alias?.value,
          arguments: buildArguments(selection.arguments),
          type: {
            kind: '__typename',
          },
        });

        continue;
      }

      if (graphql.isUnionType(parentType)) {
        continue;
      }

      const field = parentType.getFields()[selection.name.value];
      if (!field) {
        throw new Error(`Expected field: ${selection.name.value}`);
      }

      const fieldType = unwrapType(field.type);

      if (graphql.isScalarType(fieldType)) {
        selections.push({
          kind: 'ScalarField',
          name: selection.name.value,
          alias: selection.alias?.value,
          arguments: buildArguments(selection.arguments),
          type: {
            kind: 'Scalar',
            name: fieldType.name,
            isList: isListType(field.type),
            isNonNull: hasDirective(selection.directives, '_required') || graphql.isNonNullType(field.type),
          },
        });
      } else if (graphql.isEnumType(fieldType)) {
        selections.push({
          kind: 'EnumField',
          name: selection.name.value,
          alias: selection.alias?.value,
          arguments: buildArguments(selection.arguments),
          type: {
            kind: 'Enum',
            name: fieldType.name,
            values: fieldType.getValues().map((v) => v.name),
            isList: isListType(field.type),
            isNonNull: hasDirective(selection.directives, '_required') || graphql.isNonNullType(field.type),
          },
        });
      } else if (graphql.isCompositeType(fieldType)) {
        if (!selection.selectionSet) {
          throw new Error('Expected selection set');
        }

        selections.push({
          kind: 'ObjectField',
          name: selection.name.value,
          alias: selection.alias?.value,
          arguments: buildArguments(selection.arguments),
          type: {
            ...match(fieldType)
              .when(graphql.isObjectType, (t) => ({
                kind: 'Object' as const,
                name: t.name,
              }))
              .when(graphql.isInterfaceType, (t) => ({
                kind: 'Interface' as const,
                name: t.name,
                implementations: schema.getPossibleTypes(t).map((v) => v.name),
              }))
              .when(graphql.isUnionType, (t) => ({
                kind: 'Union' as const,
                name: t.name,
                members: t.getTypes().map((v) => v.name),
              }))
              .exhaustive(),
            isList: isListType(field.type),
            isNonNull: hasDirective(selection.directives, '_required') || graphql.isNonNullType(field.type),
          },
          children: buildSelections(schema, fieldType, selection.selectionSet),
        });
      }
    } else if (selection.kind === 'FragmentSpread') {
      selections.push({
        kind: 'FragmentSpread',
        name: selection.name.value,
      });
    } else if (selection.kind === 'InlineFragment') {
      if (!selection.typeCondition?.name) {
        throw new Error('Expected type condition');
      }

      const type = schema.getType(selection.typeCondition.name.value);
      if (!type) {
        throw new Error(`Expected type: ${selection.typeCondition.name.value}`);
      }

      if (graphql.isCompositeType(type)) {
        selections.push({
          kind: 'InlineFragment',
          type: selection.typeCondition.name.value,
          children: buildSelections(schema, type, selection.selectionSet),
        });
      } else {
        throw new Error(`Expected object or interface type, got: ${type.name}`);
      }
    }
  }

  return selections;
};

export const getReferencedFragments = (
  selections: Selection[],
  fragmentMap: Map<string, FragmentArtifact>,
): FragmentArtifact[] => {
  const fragments: FragmentArtifact[] = [];

  for (const selection of selections) {
    if (selection.kind === 'FragmentSpread') {
      const fragment = fragmentMap.get(selection.name);
      if (!fragment) {
        throw new Error('Fragment not found');
      }

      fragments.push(fragment, ...getReferencedFragments(fragment.selections, fragmentMap));
    } else if (selection.kind === 'ObjectField' || selection.kind === 'InlineFragment') {
      fragments.push(...getReferencedFragments(selection.children, fragmentMap));
    }
  }

  return fragments;
};
