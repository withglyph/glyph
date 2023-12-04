import * as AST from '../ast';
import type { GlitchContext } from '../types';

export const generateFunctions = (context: GlitchContext): AST.Program => {
  const program = AST.b.program([
    AST.b.importDeclaration([AST.b.importNamespaceSpecifier(AST.b.identifier('base'))], AST.b.stringLiteral('./base')),
    AST.b.importDeclaration(
      [AST.b.importNamespaceSpecifier(AST.b.identifier('types'))],
      AST.b.stringLiteral('./types'),
    ),
    AST.b.importDeclaration(
      [
        AST.b.importSpecifier(AST.b.identifier('QueryStore')),
        AST.b.importSpecifier(AST.b.identifier('MutationStore')),
        AST.b.importSpecifier(AST.b.identifier('FragmentStore')),
      ],
      AST.b.stringLiteral('@penxle/glitch'),
    ),
  ]);

  for (const { kind, type, name, source } of context.artifacts) {
    switch (kind) {
      case 'query': {
        program.body.push(
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('graphql'),
              [
                AST.b.identifier.from({
                  name: 'document',
                  typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(source))),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('QueryStore'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsUnionType([
                      AST.b.tsTypeReference(AST.b.identifier(`types.${name}`)),
                      ...(type === 'manual' ? [AST.b.tsUndefinedKeyword()] : []),
                    ]),
                    AST.b.tsTypeReference(AST.b.identifier(`base.${name}Variables`)),
                  ]),
                ),
              ),
            ),
          ),
        );

        break;
      }
      case 'mutation': {
        program.body.push(
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('graphql'),
              [
                AST.b.identifier.from({
                  name: 'document',
                  typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(source))),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('MutationStore'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(`types.${name}`)),
                    AST.b.tsTypeReference(AST.b.identifier(`base.${name}Variables`)),
                  ]),
                ),
              ),
            ),
          ),
        );

        break;
      }
      case 'subscription': {
        // TODO: implement

        break;
      }
      case 'fragment': {
        const refTypeLiteral = AST.b.tsTypeLiteral([
          AST.b.tsPropertySignature(
            AST.b.stringLiteral(' $fragmentRefs'),
            AST.b.tsTypeAnnotation(
              AST.b.tsTypeLiteral([
                AST.b.tsPropertySignature(
                  AST.b.identifier(name),
                  AST.b.tsTypeAnnotation(AST.b.tsTypeReference(AST.b.identifier(`base.${name}`))),
                ),
              ]),
            ),
            true,
          ),
        ]);

        const docTypeLiteral = AST.b.tsTypeLiteral([
          AST.b.tsPropertySignature(
            AST.b.stringLiteral(' $fragmentName'),
            AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(name))),
            true,
          ),
        ]);

        program.body.push(
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('graphql'),
              [
                AST.b.identifier.from({
                  name: 'document',
                  typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsLiteralType(AST.b.stringLiteral(source))),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('Pick'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(`base.${name}`)),
                    AST.b.tsLiteralType(AST.b.stringLiteral(' $fragmentName')),
                  ]),
                ),
              ),
            ),
          ),
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('fragment'),
              [
                AST.b.identifier.from({
                  name: 'reference',
                  typeAnnotation: AST.b.tsTypeAnnotation(refTypeLiteral),
                }),
                AST.b.identifier.from({
                  name: 'document',
                  typeAnnotation: AST.b.tsTypeAnnotation(docTypeLiteral),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('FragmentStore'),
                  AST.b.tsTypeParameterInstantiation([AST.b.tsTypeReference(AST.b.identifier(`types.${name}`))]),
                ),
              ),
            ),
          ),
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('fragment'),
              [
                AST.b.identifier.from({
                  name: 'reference',
                  typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsUnionType([refTypeLiteral, AST.b.tsNullKeyword()])),
                }),
                AST.b.identifier.from({
                  name: 'document',
                  typeAnnotation: AST.b.tsTypeAnnotation(docTypeLiteral),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsUnionType([
                  AST.b.tsTypeReference(
                    AST.b.identifier('FragmentStore'),
                    AST.b.tsTypeParameterInstantiation([
                      AST.b.tsUnionType([
                        AST.b.tsTypeReference(AST.b.identifier(`types.${name}`)),
                        AST.b.tsNullKeyword(),
                      ]),
                    ]),
                  ),
                ]),
              ),
            ),
          ),
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('fragment'),
              [
                AST.b.identifier.from({
                  name: 'reference',
                  typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsArrayType(refTypeLiteral)),
                }),
                AST.b.identifier.from({
                  name: 'document',
                  typeAnnotation: AST.b.tsTypeAnnotation(docTypeLiteral),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('FragmentStore'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsArrayType(AST.b.tsTypeReference(AST.b.identifier(`types.${name}`))),
                  ]),
                ),
              ),
            ),
          ),
        );

        break;
      }
    }
  }

  program.body.push(
    AST.b.exportNamedDeclaration(
      AST.b.tsDeclareFunction(
        AST.b.identifier('graphql'),
        [
          AST.b.identifier.from({
            name: 'document',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
        ],
        AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
      ),
    ),
    AST.b.exportNamedDeclaration(
      AST.b.tsDeclareFunction(
        AST.b.identifier('fragment'),
        [
          AST.b.identifier.from({
            name: 'reference',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
          AST.b.identifier.from({
            name: 'document',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
        ],
        AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
      ),
    ),
  );

  return program;
};
