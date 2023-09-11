import * as AST from '../ast';

export const generateMainTypes = (): AST.Program => {
  const program = AST.b.program([
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./functions')),
    AST.b.exportAllDeclaration(AST.b.stringLiteral('./public')),
    AST.b.exportNamedDeclaration(
      null,
      [
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('GraphCacheConfig'),
          exported: AST.b.identifier('GraphCacheConfig'),
        }),
      ],
      AST.b.stringLiteral('./gql'),
    ),
    AST.b.exportNamedDeclaration(
      null,
      [
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('QueryStore'),
          exported: AST.b.identifier('QueryStore'),
        }),
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('MutationStore'),
          exported: AST.b.identifier('MutationStore'),
        }),
        AST.b.exportSpecifier.from({
          local: AST.b.identifier('FragmentStore'),
          exported: AST.b.identifier('FragmentStore'),
        }),
      ],
      AST.b.stringLiteral('@penxle/glitch/runtime'),
    ),
  ]);

  return program;
};

export const generateMain = (): AST.Program => {
  const program = AST.b.program([
    AST.b.exportAllDeclaration(AST.b.stringLiteral('@penxle/glitch/runtime')),
  ]);

  return program;
};
