import fs from 'node:fs/promises';
import path from 'node:path';
import graphql from 'graphql';

export const unwrapType = (type: graphql.GraphQLType): graphql.GraphQLNamedType => {
  if (graphql.isNonNullType(type) || graphql.isListType(type)) {
    return unwrapType(type.ofType);
  }

  return type;
};

export const isListType = (type: graphql.GraphQLType): boolean => {
  return graphql.isNonNullType(type) ? isListType(type.ofType) : graphql.isListType(type);
};

export const hasDirective = (directives: readonly graphql.DirectiveNode[] | undefined, name: string) => {
  if (!directives) {
    return false;
  }

  return directives.some((directive) => {
    return directive.name.value === name;
  });
};

export const removeDirective = (
  node: graphql.OperationDefinitionNode | graphql.FragmentDefinitionNode,
  names: string[],
) => {
  return graphql.visit(node, {
    Directive: {
      enter: (directive) => {
        if (names.includes(directive.name.value)) {
          return null;
        }
      },
    },
  });
};

export const addIdAndTypenameField = (
  schema: graphql.GraphQLSchema,
  node: graphql.OperationDefinitionNode | graphql.FragmentDefinitionNode,
) => {
  return graphql.visit(node, {
    SelectionSet: {
      enter: (selectionSet) => {
        const fields = selectionSet.selections.filter((selection) => selection.kind === 'Field') as graphql.FieldNode[];
        const hasTypename = fields.some((field) => field.name.value === '__typename');

        const selections = [...selectionSet.selections];
        if (!hasTypename) {
          selections.push({
            kind: graphql.Kind.FIELD,
            name: { kind: graphql.Kind.NAME, value: '__typename' },
          });
        }

        selectionSet.selections = selections;

        return selectionSet;
      },
    },
  });
};

export const writeFile = async (path_: string, content: string) => {
  await fs.mkdir(path.dirname(path_), { recursive: true });
  await fs.writeFile(path_, content);
};
