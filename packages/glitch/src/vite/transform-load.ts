import path from 'node:path';
import recast from 'recast';
import * as AST from '../ast';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const transformLoadPlugin = (context: GlitchContext): Plugin => {
  return {
    name: '@penxle/glitch:transform-load',
    enforce: 'post',

    transform: (code, id) => {
      if (!id.endsWith('+page.ts') && !id.endsWith('+layout.ts')) {
        return;
      }

      const queries = context.artifacts.filter(
        (artifact) => artifact.kind === 'query' && path.dirname(artifact.filePath) === path.dirname(id),
      );

      if (queries.length === 0) {
        return;
      }

      let program;
      try {
        program = AST.parse(code);
      } catch {
        return;
      }
      const exportedVariables: Record<string, recast.types.namedTypes.VariableDeclarator> = {};

      AST.walk(program, {
        visitExportNamedDeclaration(p) {
          const { node } = p;

          if (node.declaration?.type === 'VariableDeclaration') {
            for (const declaration of node.declaration.declarations) {
              if (declaration.type === 'VariableDeclarator' && declaration.id.type === 'Identifier') {
                exportedVariables[declaration.id.name] = declaration;
              }
            }
          }

          this.traverse(p);
        },
      });

      const loaders = ['__glitch_load'];
      if ('load' in exportedVariables) {
        // @ts-expect-error already checked
        exportedVariables.load.id.name = '__glitch_o_load';
        loaders.unshift('__glitch_o_load');
      }

      program.body.push(
        AST.b.importDeclaration(
          [AST.b.importSpecifier(AST.b.identifier('createQueryStore'))],
          AST.b.stringLiteral('@penxle/glitch/runtime'),
        ),
        AST.b.importDeclaration(
          [AST.b.importNamespaceSpecifier(AST.b.identifier('__glitch_base'))],
          AST.b.stringLiteral('$glitch/base'),
        ),
        AST.b.functionDeclaration.from({
          id: AST.b.identifier('__glitch_load'),
          params: [AST.b.identifier('event')],
          async: true,
          body: AST.b.blockStatement([
            ...queries.map((query) =>
              AST.b.variableDeclaration('const', [
                AST.b.variableDeclarator(
                  AST.b.identifier(`__glitch_${query.name}`),
                  AST.b.awaitExpression(
                    AST.b.callExpression(AST.b.identifier('createQueryStore'), [
                      AST.b.identifier('event'),
                      AST.b.identifier(`__glitch_base.DocumentNode_${query.name}`),
                      `_${query.name}Variables` in exportedVariables
                        ? AST.b.identifier(`_${query.name}Variables`)
                        : AST.b.identifier('undefined'),
                    ]),
                  ),
                ),
              ]),
            ),
            AST.b.returnStatement(
              AST.b.objectExpression(
                queries.map((query) =>
                  AST.b.objectProperty(
                    AST.b.identifier(`__glitch_${query.name}`),
                    AST.b.identifier(`__glitch_${query.name}`),
                  ),
                ),
              ),
            ),
          ]),
        }),
        AST.b.exportNamedDeclaration(
          AST.b.functionDeclaration.from({
            id: AST.b.identifier('load'),
            params: [AST.b.identifier('event')],
            async: true,
            body: AST.b.blockStatement([
              AST.b.returnStatement(
                AST.b.objectExpression(
                  loaders.map((loader) =>
                    AST.b.spreadProperty(
                      AST.b.awaitExpression(
                        AST.b.callExpression(AST.b.identifier(loader), [AST.b.identifier('event')]),
                      ),
                    ),
                  ),
                ),
              ),
            ]),
          }),
        ),
      );

      return AST.print(program);
    },
  };
};
