import { findChildren } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    accessBarrier: {
      setAccessBarrier: () => ReturnType;
    };
  }
}

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

  addCommands() {
    return {
      setAccessBarrier:
        () =>
        ({ tr }) => {
          tr.replaceSelectionWith(this.type.create());
          return tr.docChanged;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction: (tr) => {
          const nodes = findChildren(tr.doc, (node) => node.type.name === this.name);
          return nodes.length < 2;
        },
      }),
    ];
  },
});
