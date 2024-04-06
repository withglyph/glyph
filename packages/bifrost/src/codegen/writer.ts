import path from 'node:path';
import graphql, { GraphQLSchema } from 'graphql';
import * as R from 'radash';
import * as AST from '../ast';
import { getReferencedFragments } from '../parser/selection';
import { addIdAndTypenameField, removeDirective, writeFile } from '../utils';
import { buildGraphQLFunctions, buildGraphQLTypes, buildSelectionsTSType, buildVariablesTSType } from './generator';
import type { Artifact, FragmentArtifact, OperationArtifact, StoreSchema } from '../types';

export const writeArtifactAssets = async (
  bifrostDir: string,
  schema: GraphQLSchema,
  operationMap: Map<string, OperationArtifact>,
  fragmentMap: Map<string, FragmentArtifact>,
) => {
  for (const [name, operation] of operationMap) {
    const fragments = R.unique(getReferencedFragments(operation.selections, fragmentMap), (v) => v.name);

    const source = [operation.node, ...fragments.map((v) => v.node)]
      .map((v) => graphql.print(addIdAndTypenameField(schema, removeDirective(v, ['_required', '_manual']))))
      .join('\n\n');

    const storeSchema: StoreSchema = {
      kind: operation.kind,
      name: operation.name,
      source,
      selections: {
        operation: operation.selections,
        fragments: Object.fromEntries(fragments.map((v) => [v.name, v.selections])),
      },
      meta: operation.meta,
    };

    const fn = `create${R.capitalize(operation.kind)}Store`;

    const program = AST.b.program([
      AST.b.importDeclaration.from({
        source: AST.b.stringLiteral('@withglyph/bifrost/runtime'),
        specifiers: [AST.b.importSpecifier(AST.b.identifier(fn))],
      }),
      AST.b.exportNamedDeclaration(
        AST.b.tsTypeAliasDeclaration.from({
          id: AST.b.identifier(name),
          typeAnnotation: AST.b.tsTypeLiteral([
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$name'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(name))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$kind'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(operation.kind))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$input'),
              typeAnnotation: AST.b.tsTypeAnnotation(buildVariablesTSType(operation.variables)),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$output'),
              typeAnnotation: AST.b.tsTypeAnnotation(buildSelectionsTSType(operation.selections)),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$meta'),
              typeAnnotation: AST.b.tsTypeAnnotation(
                AST.b.tsTypeLiteral(
                  Object.entries(operation.meta).map(([key, value]) =>
                    AST.b.tsPropertySignature.from({
                      key: AST.b.identifier(key),
                      typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(value))),
                    }),
                  ),
                ),
              ),
            }),
          ]),
        }),
      ),
      AST.b.variableDeclaration.from({
        kind: 'const',
        declarations: [
          AST.b.variableDeclarator.from({
            id: AST.b.identifier('schema'),
            init: AST.b.callExpression.from({
              callee: AST.b.identifier('JSON.parse'),
              arguments: [AST.b.stringLiteral(JSON.stringify(storeSchema))],
            }),
          }),
        ],
      }),
      AST.b.exportDefaultDeclaration.from({
        declaration: AST.b.functionDeclaration.from({
          id: null,
          params: [],
          body: AST.b.blockStatement([
            AST.b.returnStatement(
              AST.b.callExpression.from({
                callee: AST.b.identifier(fn),
                arguments: [AST.b.identifier('schema')],
                typeArguments: AST.b.typeParameterInstantiation([AST.b.typeParameter(name)]),
              }),
            ),
          ]),
        }),
      }),
    ]);

    const content = AST.print(program);
    await writeFile(path.join(bifrostDir, `artifacts/operations/${name}.ts`), content);
  }

  for (const [name, fragment] of fragmentMap) {
    const program = AST.b.program([
      AST.b.exportNamedDeclaration(
        AST.b.tsTypeAliasDeclaration.from({
          id: AST.b.identifier(name),
          typeAnnotation: AST.b.tsTypeLiteral([
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$name'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(name))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$kind'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(fragment.kind))),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$input'),
              typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsTypeLiteral([])),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$output'),
              typeAnnotation: AST.b.tsTypeAnnotation(buildSelectionsTSType(fragment.selections)),
            }),
            AST.b.tsPropertySignature.from({
              key: AST.b.identifier('$meta'),
              typeAnnotation: AST.b.tsTypeAnnotation(
                AST.b.tsTypeLiteral(
                  Object.entries(fragment.meta).map(([key, value]) =>
                    AST.b.tsPropertySignature.from({
                      key: AST.b.identifier(key),
                      typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(value))),
                    }),
                  ),
                ),
              ),
            }),
          ]),
        }),
      ),
    ]);

    const content = AST.print(program);
    await writeFile(path.join(bifrostDir, `artifacts/fragments/${name}.ts`), content);
  }
};

export const writePublicAssets = async (bifrostDir: string, artifacts: Artifact[]) => {
  const functions = buildGraphQLFunctions(artifacts);
  await writeFile(path.join(bifrostDir, 'public/functions.d.ts'), AST.print(functions));

  const types = buildGraphQLTypes(artifacts);
  await writeFile(path.join(bifrostDir, 'public/types.d.ts'), AST.print(types));

  const indexTs = AST.b.program([
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./public/functions')),
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./public/types')),
  ]);
  await writeFile(path.join(bifrostDir, 'index.d.ts'), AST.print(indexTs));

  const indexJs = AST.b.program([AST.b.exportAllDeclaration(AST.b.stringLiteral('@withglyph/bifrost/runtime'))]);
  await writeFile(path.join(bifrostDir, 'index.js'), AST.print(indexJs));
};

export const writeMiscAssets = async (bifrostDir: string) => {
  const client = AST.b.program([
    AST.b.exportNamedDeclaration.from({
      declaration: null,
      specifiers: [
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('default'),
          exported: AST.b.identifier('default'),
        }),
      ],
      source: AST.b.stringLiteral('../src/lib/graphql'),
    }),
  ]);
  await writeFile(path.join(bifrostDir, 'client.js'), AST.print(client));
};
