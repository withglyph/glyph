import { loadConfig } from '@unocss/config';
import { createGenerator, expandVariantGroup } from '@unocss/core';
import * as csstree from 'css-tree';
import MagicString from 'magic-string';
import { traverse } from 'object-traversal';
import { parse } from 'svelte/compiler';
import { production } from './environment';
import { hashClasses } from './hash';
import type { UnoGenerator } from '@unocss/core';
import type { PreprocessorGroup } from 'svelte/compiler';
import type { TemplateNode } from 'svelte/types/compiler/interfaces';

export const unoPreprocess = (uno?: UnoGenerator): PreprocessorGroup => {
  const unoPromise = uno ? new Promise<UnoGenerator>((resolve) => resolve(uno)) : _loadUno();

  return {
    name: '@penxle/lib/unocss',
    markup: async ({ content, filename }) => {
      const uno = await unoPromise;

      type Classes = { value: string; start: number; end: number };
      const classesList: Classes[] = [];
      const shortcutMap: Record<string, string> = {};

      const source = new MagicString(content);
      const ast = parse(content);

      const walk = (node: TemplateNode) => {
        traverse(node, ({ value: node }: { value?: TemplateNode }) => {
          if (node?.value && node.type === 'Attribute' && node.name === 'class') {
            for (const value of node.value as (TemplateNode | undefined)[]) {
              if (value) {
                walkValue(value);
              }
            }
          }
        });
      };

      const walkValue = (node: TemplateNode) => {
        if (node.type === 'Text' && typeof node.data === 'string') {
          if (node.data.trim().length === 0) {
            return;
          }

          classesList.push({
            value: node.data as string,
            start: node.start,
            end: node.end,
          });
        } else if (node.type === 'MustacheTag') {
          traverse(node, ({ value: node }: { value: TemplateNode }) => {
            if (node.type === 'Literal' && typeof node.value === 'string') {
              if (node.value.trim().length === 0) {
                return;
              }

              classesList.push({
                value: node.value,
                start: node.start + 1,
                end: node.end - 1,
              });
            }
          });
        }
      };

      const transformClasses = async (classes: string) => {
        const list = expandVariantGroup(classes).split(/\s+/);
        const knowns = new Set<string>();
        const unknowns = new Set<string>();

        for (const cls of list) {
          if (await uno.parseToken(cls)) {
            knowns.add(cls);
          } else {
            unknowns.add(cls);
          }
        }

        const unknown = [...unknowns].sort().join(' ');
        const known = [...knowns].sort().join(' ');

        if (knowns.size === 0) {
          return unknown;
        }

        if (production) {
          const hashed = hashClasses(filename ?? '', known);
          shortcutMap[hashed] = known;
          return unknowns.size === 0 ? hashed : `${unknown} ${hashed}`;
        } else {
          const hashes = [...knowns].map((cls) => {
            const hashed = hashClasses(filename ?? '', cls);
            shortcutMap[hashed] = cls;
            return hashed;
          });
          const hashed = hashes.join(' ');
          return unknowns.size === 0 ? hashed : `${unknown} ${hashed}`;
        }
      };

      walk(ast.html);

      for (const { value, start, end } of classesList) {
        const transformed = await transformClasses(value);
        source.overwrite(start, end, transformed);
      }

      if (Object.keys(shortcutMap).length === 0) {
        return;
      }

      uno.config.shortcuts = [...uno.config.shortcuts, ...Object.entries(shortcutMap)];

      const { css } = await uno.generate(Object.keys(shortcutMap), {
        preflights: false,
        safelist: false,
        minify: true,
      });

      const cssAst = csstree.parse(css);

      csstree.walk(cssAst, function (node, _, list) {
        if (node.type === 'PseudoClassSelector' && node.name === 'global') {
          // @ts-expect-error types are wrong
          return this.skip;
        }

        if (node.type === 'ClassSelector') {
          const children = list.copy();

          list.clear();
          list.push({
            type: 'PseudoClassSelector',
            name: 'global',
            children,
          });
        }
      });

      const style = csstree.generate(cssAst);

      if (ast.css) {
        source.appendRight(ast.css.content.end, `\n${style}\n`);
      } else {
        source.append(`\n<style>\n${style}\n</style>\n`);
      }

      return {
        code: source.toString(),
      };
    },
  };
};

const _loadUno = async () => {
  const { config } = await loadConfig();
  return createGenerator(config);
};
