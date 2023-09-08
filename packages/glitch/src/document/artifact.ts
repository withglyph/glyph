import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { preprocess } from 'svelte/compiler';
import * as AST from '../ast';
import type { GlitchContext } from '../types';

export const collectArtifactSources = async (context: GlitchContext) => {
  const sources: { filePath: string; source: string }[] = [];

  const filePaths = await fg('**/*.svelte', {
    cwd: context.root,
    absolute: true,
    ignore: ['node_modules'],
  });

  await Promise.all(
    filePaths.map(async (filePath) => {
      const file = await fs.readFile(filePath, 'utf8');

      await preprocess(file, {
        script: async ({ content }) => {
          let program;
          try {
            program = AST.parse(content);
          } catch {
            return;
          }

          AST.walk(program, {
            visitCallExpression(p) {
              const { node } = p;

              if (
                node.callee.type === 'Identifier' &&
                node.callee.name === 'graphql' &&
                node.arguments[0].type === 'TemplateLiteral'
              ) {
                const source = node.arguments[0].quasis[0].value.raw;
                sources.push({ filePath, source });
              }

              this.traverse(p);
            },
          });
        },
      });
    }),
  );

  return sources;
};
