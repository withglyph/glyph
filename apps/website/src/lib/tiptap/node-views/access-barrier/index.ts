import { findChildren } from '@tiptap/core';
import { Plugin, TextSelection } from '@tiptap/pm/state';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

export const AccessBarrier = createNodeView(Component, {
  name: 'access_barrier',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      price: {},
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-a': ({ editor }) => {
        const nodes = findChildren(editor.state.doc, (node) => node.type === this.type);
        if (nodes.length !== 1) {
          return false;
        }

        const thisPos = nodes[0].pos;
        const { $anchor } = editor.state.selection;

        if ($anchor.pos < thisPos) {
          return editor.commands.setTextSelection({
            from: 0,
            to: thisPos - 1,
          });
        } else if ($anchor.pos > thisPos) {
          return editor.commands.setTextSelection({
            from: thisPos + 1,
            to: editor.state.doc.nodeSize,
          });
        } else {
          return true;
        }
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_, __, newState) => {
          const nodes = findChildren(newState.doc, (node) => node.type === this.type);

          if (nodes.length !== 1) {
            return null;
          }

          const thisPos = nodes[0].pos;
          const { $from, $to, $anchor } = newState.selection;

          if ($from.pos < thisPos && $to.pos > thisPos) {
            const { tr } = newState;

            if ($anchor.pos < thisPos) {
              tr.setSelection(TextSelection.create(newState.doc, $anchor.pos, thisPos - 1));
            } else if ($anchor.pos > thisPos) {
              tr.setSelection(TextSelection.create(newState.doc, thisPos + 1, $anchor.pos));
            }

            return tr;
          }

          return null;
        },
        filterTransaction: (tr) => {
          const nodes = findChildren(tr.doc, (node) => node.type === this.type);
          return nodes.length === 1;
        },
      }),
    ];
  },
});
