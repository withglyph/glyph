import * as AST from '../ast';
import type { GlitchContext } from '../types';

export const generateTypes = (context: GlitchContext): AST.Program => {
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

  for (const { kind, name } of context.artifacts) {
    switch (kind) {
      case 'query': {
        // TODO: implement

        break;
      }
      case 'mutation': {
        // TODO: implement

        break;
      }
      case 'subscription': {
        // TODO: implement

        break;
      }
      case 'fragment': {
        program.body.push(
          AST.b.exportNamedDeclaration(
            AST.b.tsTypeAliasDeclaration(
              AST.b.identifier(name),
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
          ),
        );

        break;
      }
    }
  }

  return program;
};
