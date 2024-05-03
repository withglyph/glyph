import graphql from 'graphql';
import { isListType, unwrapType } from '../utils';
import type { Variable } from '../types';

const unwrapTypeNode = (typeNode: graphql.TypeNode): graphql.NamedTypeNode => {
  if (typeNode.kind === 'NonNullType' || typeNode.kind === 'ListType') {
    return unwrapTypeNode(typeNode.type);
  }

  return typeNode;
};

const isListTypeNode = (typeNode: graphql.TypeNode): boolean => {
  return typeNode.kind === 'NonNullType' ? isListTypeNode(typeNode.type) : typeNode.kind == 'ListType';
};

const buildInputObjectVariables = (schema: graphql.GraphQLSchema, type: graphql.GraphQLInputObjectType) => {
  const variables: Variable[] = [];

  for (const field of Object.values(type.getFields())) {
    const fieldType = unwrapType(field.type);

    if (graphql.isScalarType(fieldType)) {
      variables.push({
        kind: 'ScalarField',
        name: field.name,
        type: {
          kind: 'Scalar',
          name: fieldType.name,
          isList: isListType(field.type),
          isNonNull: graphql.isNonNullType(field.type),
        },
      });
    } else if (graphql.isEnumType(fieldType)) {
      variables.push({
        kind: 'EnumField',
        name: field.name,
        type: {
          kind: 'Enum',
          name: fieldType.name,
          values: fieldType.getValues().map((v) => v.name),
          isList: isListType(field.type),
          isNonNull: graphql.isNonNullType(field.type),
        },
      });
    } else if (graphql.isInputObjectType(fieldType)) {
      variables.push({
        kind: 'InputObjectField',
        name: field.name,
        type: {
          kind: 'InputObject',
          name: fieldType.name,
          isList: isListType(field.type),
          isNonNull: graphql.isNonNullType(field.type),
        },
        children: buildInputObjectVariables(schema, fieldType),
      });
    }
  }

  return variables;
};

export const buildVariables = (
  schema: graphql.GraphQLSchema,
  variableDefinitions: readonly graphql.VariableDefinitionNode[] | undefined,
) => {
  const variables: Variable[] = [];

  if (!variableDefinitions) {
    return variables;
  }

  for (const variableDefinition of variableDefinitions) {
    const typeName = unwrapTypeNode(variableDefinition.type).name.value;

    const type = schema.getType(typeName);
    if (!type) {
      throw new Error(`Expected type: ${typeName}`);
    }

    if (graphql.isScalarType(type)) {
      variables.push({
        kind: 'ScalarField',
        name: variableDefinition.variable.name.value,
        type: {
          kind: 'Scalar',
          name: type.name,
          isList: isListTypeNode(variableDefinition.type),
          isNonNull: variableDefinition.type.kind === 'NonNullType',
        },
      });
    } else if (graphql.isEnumType(type)) {
      variables.push({
        kind: 'EnumField',
        name: variableDefinition.variable.name.value,
        type: {
          kind: 'Enum',
          name: type.name,
          values: type.getValues().map((v) => v.name),
          isList: isListTypeNode(variableDefinition.type),
          isNonNull: variableDefinition.type.kind === 'NonNullType',
        },
      });
    } else if (graphql.isInputObjectType(type)) {
      variables.push({
        kind: 'InputObjectField',
        name: variableDefinition.variable.name.value,
        type: {
          kind: 'InputObject',
          name: type.name,
          isList: isListTypeNode(variableDefinition.type),
          isNonNull: variableDefinition.type.kind === 'NonNullType',
        },
        children: buildInputObjectVariables(schema, type),
      });
    }
  }

  return variables;
};
