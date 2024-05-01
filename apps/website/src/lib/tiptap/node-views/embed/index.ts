import { nodePasteRule } from '@tiptap/core';
import * as linkifyjs from 'linkifyjs';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

export const Embed = createNodeView(Component, {
  name: 'embed',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      url: { isRequired: true },
      mode: { default: 'opengraph' },
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: (text) => {
          // eslint-disable-next-line unicorn/no-array-callback-reference
          const links = linkifyjs.find(text);
          return links.map((link) => ({
            index: link.start,
            text: link.value,
            data: link,
          }));
        },
        type: this.type,
        getAttributes: (match) => ({ url: match.data?.href }),
      }),
    ];
  },
});
