import { findChildren } from '@tiptap/core';
import { Slice } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

export const AccessBarrier = createNodeView(Component, {
  name: 'access_barrier',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      price: {},
      __data: {},
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformCopied: () => Slice.empty,
        },
        filterTransaction: (tr) => {
          const nodes = findChildren(tr.doc, (node) => node.type.name === this.name);
          return nodes.length === 1;
        },
      }),
    ];
  },
});
