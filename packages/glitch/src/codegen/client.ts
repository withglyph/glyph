import * as AST from '../ast';

export const generateClient = () => {
  const program = AST.b.program([
    AST.b.exportNamedDeclaration(
      null,
      [
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('default'),
          exported: AST.b.identifier('default'),
        }),
      ],
      AST.b.stringLiteral('../src/lib/glitch'),
    ),
  ]);

  return program;
};
