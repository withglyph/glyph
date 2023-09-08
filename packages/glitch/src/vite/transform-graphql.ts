import path from 'node:path';
import * as AST from '../ast';
import type { PreprocessorGroup } from 'svelte/compiler';
import type { Plugin } from 'vite';
import type { GlitchContext } from '../types';

export const transformGraphQLPlugin = (context: GlitchContext): Plugin => {
  const transformQuery = (filename: string, program: AST.Program) => {
    if (!/^\+(page|layout)/.test(path.basename(filename))) {
      return false;
    }

    const queries = context.artifacts.filter(
      (artifact) => artifact.kind === 'query' && artifact.filePath === filename,
    );

    if (queries.length === 0) {
      return false;
    }

    let dataProp = false;

    AST.walk(program, {
      visitExportNamedDeclaration(p) {
        const { node } = p;
        if (
          node.declaration?.type === 'VariableDeclaration' &&
          node.declaration.declarations.some(
            (d) =>
              d.type === 'VariableDeclarator' &&
              d.id.type === 'Identifier' &&
              d.id.name === 'data',
          )
        ) {
          dataProp = true;
        }

        this.traverse(p);
      },
      visitCallExpression(p) {
        const { node } = p;

        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'graphql' &&
          node.arguments[0].type === 'TemplateLiteral'
        ) {
          const source = node.arguments[0].quasis[0].value.raw;
          const query = queries.find((query) => query.source === source);

          if (query) {
            p.replace(AST.b.identifier(`data.__glitch_${query.name}`));
          }
        }

        this.traverse(p);
      },
    });

    if (!dataProp) {
      program.body.unshift(
        AST.b.exportNamedDeclaration(
          AST.b.variableDeclaration('let', [
            AST.b.variableDeclarator(AST.b.identifier('data')),
          ]),
        ),
      );
    }

    return true;
  };

  const transformMutation = (filename: string, program: AST.Program) => {
    const mutations = context.artifacts.filter(
      (artifact) =>
        artifact.kind === 'mutation' && artifact.filePath === filename,
    );

    if (mutations.length === 0) {
      return false;
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
          const mutation = mutations.find(
            (mutation) => mutation.source === source,
          );

          if (mutation) {
            node.arguments[0] = AST.b.stringLiteral('mutation');
            node.arguments.push(
              AST.b.identifier(`__glitch_gql.DocumentNode_${mutation.name}`),
            );
          }
        }

        this.traverse(p);
      },
    });

    program.body.unshift(
      AST.b.importDeclaration(
        [AST.b.importNamespaceSpecifier(AST.b.identifier('__glitch_gql'))],
        AST.b.stringLiteral('$glitch/gql'),
      ),
    );

    return true;
  };

  const sveltePreprocess: PreprocessorGroup = {
    name: '@penxle/glitch:transform-graphql',
    script: ({ content, filename }) => {
      if (!filename) {
        return;
      }

      let program;
      try {
        program = AST.parse(content);
      } catch {
        return;
      }

      if (
        transformQuery(filename, program) ||
        transformMutation(filename, program)
      ) {
        return AST.print(program);
      }
    },
  };

  return {
    name: '@penxle/glitch:transform-graphql',
    enforce: 'post',

    api: { sveltePreprocess },
  };
};
