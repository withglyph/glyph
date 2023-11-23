import * as AST from '../ast';

export const generateMainTypes = (): AST.Program => {
  const program = AST.b.program([
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./fragments')),
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./functions')),
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./enums')),
    AST.b.exportNamedDeclaration(
      null,
      [
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('GraphCacheConfig'),
          exported: AST.b.identifier('GraphCacheConfig'),
        }),
      ],
      AST.b.stringLiteral('./base'),
    ),
    AST.b.exportNamedDeclaration(
      null,
      [
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('FragmentType'),
          exported: AST.b.identifier('FragmentType'),
        }),
      ],
      AST.b.stringLiteral('@penxle/glitch/runtime'),
    ),
  ]);

  return program;
};

export const generateMain = (): AST.Program => {
  const program = AST.b.program([AST.b.exportAllDeclaration(AST.b.stringLiteral('@penxle/glitch/runtime'))]);

  return program;
};
