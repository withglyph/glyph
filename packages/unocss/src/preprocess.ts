import { loadConfig } from '@unocss/config';
import { createGenerator, expandVariantGroup } from '@unocss/core';
import MagicString from 'magic-string';
import { traverse } from 'object-traversal';
import { parse } from 'svelte/compiler';
import { production } from './environment';
import { hashClasses } from './hash';
import type { UnoGenerator } from '@unocss/core';
import type { PreprocessorGroup } from 'svelte/compiler';
import type { TemplateNode } from 'svelte/types/compiler/interfaces';

export const unoPreprocess = (uno?: UnoGenerator): PreprocessorGroup => {
  const unoPromise = uno
    ? new Promise<UnoGenerator>((resolve) => resolve(uno))
    : _loadUno();

  return {
    name: '@penxle/unocss',
    markup: async ({ content, filename }) => {
      const uno = await unoPromise;

      type Replacement = { value: string; start: number; end: number };
      const replacements: Array<Replacement> = [];
      const shortcuts: Record<string, string> = {};

      const source = new MagicString(content);
      const ast = parse(content);

      const walk = (node: TemplateNode) => {
        traverse(node, ({ value: node }) => {
          if (
            node?.value &&
            node.type === 'Attribute' &&
            node.name === 'class'
          ) {
            for (const value of node.value) {
              walkValue(value);
            }
          }
        });
      };

      const walkValue = (node: TemplateNode) => {
        if (node?.type === 'Text') {
          replacements.push({
            value: node.data,
            start: node.start,
            end: node.end,
          });
        } else if (node?.type === 'MustacheTag') {
          traverse(node, ({ value: node }) => {
            if (node?.type === 'Literal' && typeof node.value === 'string') {
              replacements.push({
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
          shortcuts[hashed] = known;
          return unknowns.size === 0 ? hashed : `${unknown} ${hashed}`;
        } else {
          const hashes = [...knowns].map((cls) => {
            const hashed = hashClasses(filename ?? '', cls);
            shortcuts[hashed] = cls;
            return hashed;
          });
          const hashed = hashes.join(' ');
          return unknowns.size === 0 ? hashed : `${unknown} ${hashed}`;
        }
      };

      walk(ast.html);

      for (const { value, start, end } of replacements) {
        const shortcut = await transformClasses(value);
        source.overwrite(start, end, shortcut);
      }

      if (Object.keys(shortcuts).length === 0) {
        return;
      }

      const configuredShortcuts = uno.config.shortcuts;
      uno.config.shortcuts = [
        ...configuredShortcuts,
        ...Object.entries(shortcuts),
      ];

      const { css } = await uno.generate(Object.keys(shortcuts), {
        preflights: false,
        safelist: false,
        minify: true,
      });

      uno.config.shortcuts = configuredShortcuts;

      const style = css.replaceAll(/(\.\S+?)({[\S\s]+?})/g, ':global($1) $2');

      if (ast.css) {
        source.appendRight(ast.css.content.end, `\n${style}\n`);
      } else {
        source.append(`\n<style>\n${style}\n</style>\n`);
      }

      return {
        code: source.toString(),
        map: source.generateMap({ hires: true, source: filename }),
      };
    },
  };
};

const _loadUno = async () => {
  const { config } = await loadConfig();
  return createGenerator(config);
};
