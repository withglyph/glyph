import * as AST from '../ast';
import type { GlitchContext } from '../types';

export const generateFunctions = (context: GlitchContext) => {
  const program = AST.b.program([
    AST.b.importDeclaration(
      [AST.b.importNamespaceSpecifier(AST.b.identifier('gql'))],
      AST.b.stringLiteral('./gql'),
    ),
    AST.b.importDeclaration(
      [AST.b.importNamespaceSpecifier(AST.b.identifier('glitch'))],
      AST.b.stringLiteral('@penxle/glitch/runtime'),
    ),
  ]);

  for (const { kind, name, source } of context.artifacts) {
    switch (kind) {
      case 'query': {
        program.body.push(
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('graphql'),
              [
                AST.b.identifier.from({
                  name: 'doc',
                  typeAnnotation: AST.b.tsTypeAnnotation(
                    AST.b.tsLiteralType(AST.b.stringLiteral(source)),
                  ),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('glitch.QueryStore'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(`gql.${name}`)),
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
                  name: 'doc',
                  typeAnnotation: AST.b.tsTypeAnnotation(
                    AST.b.tsLiteralType(AST.b.stringLiteral(source)),
                  ),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('glitch.MutationStore'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(`gql.${name}`)),
                    AST.b.tsTypeReference(
                      AST.b.identifier(`gql.${name}Variables`),
                    ),
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
        program.body.push(
          AST.b.exportNamedDeclaration(
            AST.b.tsDeclareFunction(
              AST.b.identifier('graphql'),
              [
                AST.b.identifier.from({
                  name: 'doc',
                  typeAnnotation: AST.b.tsTypeAnnotation(
                    AST.b.tsLiteralType(AST.b.stringLiteral(source)),
                  ),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('Pick'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(`gql.${name}`)),
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
                  name: 'ref',
                  typeAnnotation: AST.b.tsTypeAnnotation(
                    AST.b.tsTypeLiteral([
                      AST.b.tsPropertySignature(
                        AST.b.stringLiteral(' $fragmentRefs'),
                        AST.b.tsTypeAnnotation(
                          AST.b.tsTypeLiteral([
                            AST.b.tsPropertySignature(
                              AST.b.identifier(name),
                              AST.b.tsTypeAnnotation(
                                AST.b.tsTypeReference(
                                  AST.b.identifier(`gql.${name}`),
                                ),
                              ),
                            ),
                          ]),
                        ),
                        true,
                      ),
                    ]),
                  ),
                }),
                AST.b.identifier.from({
                  name: 'doc',
                  typeAnnotation: AST.b.tsTypeAnnotation(
                    AST.b.tsTypeLiteral([
                      AST.b.tsPropertySignature(
                        AST.b.stringLiteral(' $fragmentName'),
                        AST.b.tsTypeAnnotation(
                          AST.b.tsLiteralType(AST.b.stringLiteral(name)),
                        ),
                        true,
                      ),
                    ]),
                  ),
                }),
              ],
              AST.b.tsTypeAnnotation(
                AST.b.tsTypeReference(
                  AST.b.identifier('glitch.FragmentStore'),
                  AST.b.tsTypeParameterInstantiation([
                    AST.b.tsTypeReference(AST.b.identifier(`gql.${name}`)),
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
            name: 'doc',
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
            name: 'ref',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
          AST.b.identifier.from({
            name: 'doc',
            typeAnnotation: AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
          }),
        ],
        AST.b.tsTypeAnnotation(AST.b.tsNeverKeyword()),
      ),
    ),
  );

  return program;
};
