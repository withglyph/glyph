import * as AST from '../ast';
import type { PreprocessorGroup } from 'svelte/compiler';
import type { Plugin } from 'vite';
import type { ContextHolder } from '../types';

export const transformGraphQLPlugin = (contextHolder: ContextHolder): Plugin => {
  const sveltePreprocess: PreprocessorGroup = {
    name: '@withglyph/bifrost:transform-graphql',
    script: ({ content, attributes }) => {
      if (attributes.lang !== 'ts' || attributes.type !== undefined) {
        return;
      }

      const { context } = contextHolder;
      if (!context) {
        return;
      }

      let program;
      try {
        program = AST.parse(content);
      } catch {
        return;
      }

      let needDataProp = false;

      AST.walk(program, {
        visitCallExpression(p) {
          const { node } = p;

          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 'graphql' &&
            node.arguments[0].type === 'TemplateLiteral'
          ) {
            const source = node.arguments[0].quasis[0].value.raw;
            const artifact = context.artifacts.find((artifact) => artifact.source === source);

            if (artifact) {
              if (artifact.kind === 'fragment') {
                p.replace(AST.b.nullLiteral());
              } else if (artifact.kind === 'query' && artifact.meta.mode !== 'manual') {
                p.replace(AST.b.identifier(`__bifrost_data.__bifrost_${artifact.name}`));
                needDataProp = true;
              } else {
                p.replace(
                  AST.b.callExpression.from({
                    callee: AST.b.identifier(`__bifrost_${artifact.name}`),
                    arguments: [],
                  }),
                );
                program.body.unshift(
                  AST.b.importDeclaration.from({
                    source: AST.b.stringLiteral(`$bifrost/artifacts/operations/${artifact.name}`),
                    specifiers: [
                      AST.b.importDefaultSpecifier.from({
                        local: AST.b.identifier(`__bifrost_${artifact.name}`),
                      }),
                    ],
                  }),
                );
              }
            }
          }

          this.traverse(p);
        },
      });

      if (needDataProp) {
        program.body.unshift(
          AST.b.variableDeclaration.from({
            kind: 'let',
            declarations: [AST.b.identifier('__bifrost_data')],
          }),
          AST.b.exportNamedDeclaration.from({
            declaration: null,
            specifiers: [
              AST.b.exportSpecifier.from({
                local: AST.b.identifier('__bifrost_data'),
                exported: AST.b.identifier('data'),
              }),
            ],
          }),
        );
      }

      return {
        code: AST.print(program),
      };
    },
  };

  return {
    name: '@withglyph/bifrost:transform-graphql',
    enforce: 'post',

    api: { sveltePreprocess },
  };
};
