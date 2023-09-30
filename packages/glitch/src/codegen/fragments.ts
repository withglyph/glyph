import * as AST from '../ast';
import type { GlitchContext } from '../types';

export const generateFragmentTypes = (context: GlitchContext): AST.Program => {
  const program = AST.b.program([
    AST.b.importDeclaration([AST.b.importNamespaceSpecifier(AST.b.identifier('base'))], AST.b.stringLiteral('./base')),
  ]);

  for (const { kind, name } of context.artifacts) {
    if (kind !== 'fragment') {
      continue;
    }

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
                    AST.b.tsTypeAnnotation(AST.b.tsTypeReference(AST.b.identifier(`base.${name}`))),
                  ),
                ]),
              ),
              true,
            ),
          ]),
        ),
      ),
    );
  }

  return program;
};
