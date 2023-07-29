import { loadConfig } from '@unocss/config';
import { createGenerator, expandVariantGroup } from '@unocss/core';
import MagicString from 'magic-string';
import { traverse } from 'object-traversal';
import { parse } from 'svelte/compiler';
import { production } from './environment';
import { hashClasses } from './hash';
import type { PreprocessorGroup } from 'svelte/compiler';
import type { Attribute, TemplateNode } from 'svelte/types/compiler/interfaces';

export const unoPreprocess = (): PreprocessorGroup => {
  const configPromise = loadConfig();

  return {
    name: '@penxle/unocss',
    markup: async ({ content, filename }) => {
      const { config } = await configPromise;
      const generator = createGenerator(config);

      const shortcuts: Record<string, string> = {};
      const source = new MagicString(content);
      const ast = parse(content);

      const walk = async (node: TemplateNode) => {
        if (node.children) {
          await Promise.all(node.children.map(async (child) => walk(child)));
        }

        if (
          node.type === 'InlineComponent' ||
          node.type === 'SlotTemplate' ||
          node.type === 'Title' ||
          node.type === 'Slot' ||
          node.type === 'Element' ||
          node.type === 'Head' ||
          node.type === 'Options' ||
          node.type === 'Window' ||
          node.type === 'Document' ||
          node.type === 'Body'
        ) {
          await Promise.all(
            node.attributes
              .filter(
                (attr: TemplateNode) =>
                  attr.type === 'Attribute' && attr.name === 'class',
              )
              .flatMap((attr: Attribute) =>
                attr.value.map(async (value) => walkValue(value)),
              ),
          );
        }
      };

      const walkValue = async (node: TemplateNode) => {
        if (node.type === 'Text') {
          const shortcut = await transformClasses(node.data);
          source.overwrite(node.start, node.end, shortcut);
        } else if (node.type === 'MustacheTag') {
          traverse(node, async ({ value: node }) => {
            if (node.type === 'Literal' && typeof node.value === 'string') {
              const shortcut = await transformClasses(node.value);
              source.overwrite(node.start + 1, node.end - 1, shortcut);
            }
          });
        }
      };

      const transformClasses = async (classes: string) => {
        const list = expandVariantGroup(classes).split(/\s+/);
        const knowns = new Set<string>();
        const unknowns = new Set<string>();

        for (const cls of list) {
          if (await generator.parseToken(cls)) {
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

      await walk(ast.html);

      if (Object.keys(shortcuts).length === 0) {
        return;
      }

      generator.config.shortcuts = [
        ...generator.config.shortcuts,
        ...Object.entries(shortcuts),
      ];

      const { css } = await generator.generate(Object.keys(shortcuts), {
        preflights: false,
        safelist: false,
        minify: true,
      });

      const style = css.replaceAll(/(\.\S+?)({[\S\s]+?})/g, ':global($1)$2');

      if (ast.css) {
        source.appendRight(ast.css.content.end, style);
      } else {
        source.append(`<style>${style}</style>`);
      }

      return {
        code: source.toString(),
        map: source.generateMap({ hires: true, source: filename }),
      };
    },
  };
};
