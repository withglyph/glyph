import * as R from 'radash';
import * as recast from 'recast';
import * as AST from '../ast';
import { scalarTSTypes } from '../const';
import type { Artifact, CompositeType, Selection, Variable } from '../types';

const buildScalarRefTSType = (name: string, direction: 'Input' | 'Output') => {
  const type = scalarTSTypes[name as keyof typeof scalarTSTypes][direction];
  return AST.b.tsTypeReference(AST.b.identifier(type));
};

const wrapTSType = (type: Parameters<typeof AST.b.tsArrayType>[0], isList: boolean, isNonNull: boolean) => {
  const t = isList ? AST.b.tsArrayType(AST.b.tsParenthesizedType(type)) : type;
  return isNonNull ? t : AST.b.tsUnionType([t, AST.b.tsUndefinedKeyword(), AST.b.tsNullKeyword()]);
};

type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never;

export const buildSelectionsTSType = (
  selections: Selection[],
  parentType?: DistributiveOmit<CompositeType, 'isNonNull' | 'isList'>,
): recast.types.namedTypes.TSTypeLiteral | recast.types.namedTypes.TSUnionType => {
  const literal = AST.b.tsTypeLiteral([]);

  if (parentType) {
    if (parentType.kind === 'Interface') {
      return AST.b.tsUnionType(
        parentType.implementations.map((v) => buildSelectionsTSType(selections, { kind: 'Object', name: v })),
      );
    } else if (parentType.kind === 'Union') {
      return AST.b.tsUnionType(
        parentType.members.map((v) => buildSelectionsTSType(selections, { kind: 'Object', name: v })),
      );
    }
  }

  const selectionsQueue = [...selections];

  while (selectionsQueue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const selection = selectionsQueue.shift()!;

    // eslint-disable-next-line unicorn/prefer-switch
    if (selection.kind === 'TypenameField') {
      literal.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(selection.alias ?? selection.name),
          typeAnnotation: AST.b.tsTypeAnnotation(
            parentType ? AST.b.tsLiteralType(AST.b.stringLiteral(parentType.name)) : AST.b.tsNeverKeyword(),
          ),
        }),
      );
    } else if (selection.kind === 'ScalarField') {
      literal.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(selection.alias ?? selection.name),
          optional: !selection.type.isNonNull,
          typeAnnotation: AST.b.tsTypeAnnotation(
            wrapTSType(
              buildScalarRefTSType(selection.type.name, 'Output'),
              selection.type.isList,
              selection.type.isNonNull,
            ),
          ),
        }),
      );
    } else if (selection.kind === 'EnumField') {
      literal.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(selection.alias ?? selection.name),
          optional: !selection.type.isNonNull,
          typeAnnotation: AST.b.tsTypeAnnotation(
            wrapTSType(
              AST.b.tsUnionType(selection.type.values.map((v) => AST.b.tsLiteralType(AST.b.stringLiteral(v)))),
              selection.type.isList,
              selection.type.isNonNull,
            ),
          ),
        }),
      );
    } else if (selection.kind === 'ObjectField') {
      literal.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(selection.alias ?? selection.name),
          optional: !selection.type.isNonNull,
          typeAnnotation: AST.b.tsTypeAnnotation(
            wrapTSType(
              buildSelectionsTSType(selection.children, selection.type),
              selection.type.isList,
              selection.type.isNonNull,
            ),
          ),
        }),
      );
    } else if (selection.kind === 'InlineFragment') {
      if (parentType && selection.type === parentType.name) {
        selectionsQueue.push(...selection.children);
      }
    } else if (selection.kind === 'FragmentSpread') {
      literal.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(` $$_${selection.name}`),
          optional: true,
          typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
        }),
      );
    }
  }

  return literal;
};

export const buildVariablesTSType = (variables: Variable[]): recast.types.namedTypes.TSTypeLiteral => {
  const base = AST.b.tsTypeLiteral([]);

  for (const variable of variables) {
    // eslint-disable-next-line unicorn/prefer-switch
    if (variable.kind === 'ScalarField') {
      base.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(variable.name),
          optional: !variable.type.isNonNull,
          typeAnnotation: AST.b.tsTypeAnnotation(
            wrapTSType(
              buildScalarRefTSType(variable.type.name, 'Input'),
              variable.type.isList,
              variable.type.isNonNull,
            ),
          ),
        }),
      );
    } else if (variable.kind === 'EnumField') {
      base.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(variable.name),
          optional: !variable.type.isNonNull,
          typeAnnotation: AST.b.tsTypeAnnotation(
            wrapTSType(
              AST.b.tsUnionType(variable.type.values.map((v) => AST.b.tsLiteralType(AST.b.stringLiteral(v)))),
              variable.type.isList,
              variable.type.isNonNull,
            ),
          ),
        }),
      );
    } else if (variable.kind === 'InputObjectField') {
      base.members.push(
        AST.b.tsPropertySignature.from({
          key: AST.b.stringLiteral(variable.name),
          optional: !variable.type.isNonNull,
          typeAnnotation: AST.b.tsTypeAnnotation(
            wrapTSType(buildVariablesTSType(variable.children), variable.type.isList, variable.type.isNonNull),
          ),
        }),
      );
    }
  }

  return base;
};

export const buildGraphQLFunctions = (artifacts: Artifact[]): AST.Program => {
  const program = AST.b.program([
    AST.b.importDeclaration.from({
      importKind: 'type',
      source: AST.b.stringLiteral('./types'),
      specifiers: [AST.b.importNamespaceSpecifier(AST.b.identifier('types'))],
    }),
    AST.b.importDeclaration.from({
      importKind: 'type',
      source: AST.b.stringLiteral('@withglyph/bifrost/runtime'),
      specifiers: [
        AST.b.importSpecifier(AST.b.identifier('QueryStore')),
        AST.b.importSpecifier(AST.b.identifier('MutationStore')),
        AST.b.importSpecifier(AST.b.identifier('SubscriptionStore')),
        AST.b.importSpecifier(AST.b.identifier('FragmentStore')),
      ],
    }),
    ...artifacts.map((artifact) =>
      AST.b.importDeclaration.from({
        importKind: 'type',
        source: AST.b.stringLiteral(
          `../artifacts/${artifact.kind === 'fragment' ? 'fragments' : 'operations'}/${artifact.name}`,
        ),
        specifiers: [AST.b.importSpecifier(AST.b.identifier(artifact.name))],
      }),
    ),
  ]);

  for (const artifact of artifacts) {
    program.body.push(
      AST.b.exportNamedDeclaration(
        AST.b.tsDeclareFunction.from({
          id: AST.b.identifier('graphql'),
          params: [
            AST.b.identifier.from({
              name: 'source',
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(artifact.source))),
            }),
          ],
          returnType: AST.b.tsTypeAnnotation(
            artifact.kind === 'fragment'
              ? AST.b.tsTypeReference(AST.b.identifier(`types.${artifact.name}`))
              : AST.b.tsTypeReference.from({
                  typeName: AST.b.identifier(`${R.capitalize(artifact.kind)}Store`),
                  typeParameters: AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(artifact.name)),
                  ]),
                }),
          ),
        }),
      ),
    );

    if (artifact.kind === 'fragment') {
      program.body.push(
        AST.b.exportNamedDeclaration(
          AST.b.tsDeclareFunction.from({
            id: AST.b.identifier('fragment'),
            params: [
              AST.b.identifier.from({
                name: 'prop',
                typeAnnotation: AST.b.tsTypeAnnotation(
                  AST.b.tsTypeReference(AST.b.identifier(`types.${artifact.name}`)),
                ),
              }),
              AST.b.identifier.from({
                name: 'doc',
                typeAnnotation: AST.b.tsTypeAnnotation(
                  AST.b.tsTypeReference(AST.b.identifier(`types.${artifact.name}`)),
                ),
              }),
            ],
            returnType: AST.b.tsTypeAnnotation(
              AST.b.tsTypeReference.from({
                typeName: AST.b.identifier(`FragmentStore`),
                typeParameters: AST.b.tsTypeParameterInstantiation([
                  AST.b.tsTypeReference(AST.b.identifier(artifact.name)),
                ]),
              }),
            ),
          }),
        ),
        AST.b.exportNamedDeclaration(
          AST.b.tsDeclareFunction.from({
            id: AST.b.identifier('fragment'),
            params: [
              AST.b.identifier.from({
                name: 'prop',
                typeAnnotation: AST.b.tsTypeAnnotation(
                  AST.b.tsArrayType(AST.b.tsTypeReference(AST.b.identifier(`types.${artifact.name}`))),
                ),
              }),
              AST.b.identifier.from({
                name: 'doc',
                typeAnnotation: AST.b.tsTypeAnnotation(
                  AST.b.tsTypeReference(AST.b.identifier(`types.${artifact.name}`)),
                ),
              }),
            ],
            returnType: AST.b.tsTypeAnnotation(
              AST.b.tsTypeReference.from({
                typeName: AST.b.identifier(`FragmentStore`),
                typeParameters: AST.b.tsTypeParameterInstantiation([
                  AST.b.tsArrayType(AST.b.tsTypeReference(AST.b.identifier(artifact.name))),
                ]),
              }),
            ),
          }),
        ),
        AST.b.exportNamedDeclaration(
          AST.b.tsDeclareFunction.from({
            id: AST.b.identifier('fragment'),
            params: [
              AST.b.identifier.from({
                name: 'prop',
                typeAnnotation: AST.b.tsTypeAnnotation(
                  AST.b.tsUnionType([
                    AST.b.tsTypeReference(AST.b.identifier(`types.${artifact.name}`)),
                    AST.b.tsNullKeyword(),
                  ]),
                ),
              }),
              AST.b.identifier.from({
                name: 'doc',
                typeAnnotation: AST.b.tsTypeAnnotation(
                  AST.b.tsTypeReference(AST.b.identifier(`types.${artifact.name}`)),
                ),
              }),
            ],
            returnType: AST.b.tsTypeAnnotation(
              AST.b.tsUnionType([
                AST.b.tsTypeReference.from({
                  typeName: AST.b.identifier(`FragmentStore`),
                  typeParameters: AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(artifact.name)),
                  ]),
                }),
                AST.b.tsNullKeyword(),
              ]),
            ),
          }),
        ),
      );
    }
  }

  program.body.push(
    AST.b.exportNamedDeclaration(
      AST.b.tsDeclareFunction.from({
        id: AST.b.identifier('graphql'),
        params: [
          AST.b.identifier.from({
            name: 'doc',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
        ],
        returnType: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
      }),
    ),
    AST.b.exportNamedDeclaration(
      AST.b.tsDeclareFunction.from({
        id: AST.b.identifier('fragment'),
        params: [
          AST.b.identifier.from({
            name: 'prop',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
          AST.b.identifier.from({
            name: 'doc',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
        ],
        returnType: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
      }),
    ),
  );

  return program;
};

export const buildGraphQLTypes = (artifacts: Artifact[]): AST.Program => {
  const program = AST.b.program([]);

  for (const artifact of artifacts) {
    if (artifact.kind === 'fragment') {
      program.body.push(
        AST.b.exportNamedDeclaration(
          AST.b.tsTypeAliasDeclaration.from({
            id: AST.b.identifier(`${artifact.name}`),
            typeAnnotation: AST.b.tsTypeLiteral([
              AST.b.tsPropertySignature.from({
                key: AST.b.stringLiteral(` $$_${artifact.name}`),
                optional: true,
                typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
              }),
            ]),
          }),
        ),
      );
    }
  }

  return program;
};
