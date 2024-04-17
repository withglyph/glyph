import { findChildren } from '@tiptap/core';
import { NodeSelection, Plugin } from '@tiptap/pm/state';
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
        appendTransaction: (transactions, oldState, newState) => {
          if (!this.editor.isEditable) {
            return null;
          }

          const { tr } = newState;

          const oldNodes = findChildren(oldState.doc, (node) => node.type.name === this.name);
          const newNodes = findChildren(newState.doc, (node) => node.type.name === this.name);

          if (oldNodes.length !== 1) {
            return null;
          }

          const [oldNode] = oldNodes;
          let pos = oldNode.pos;
          for (const transaction of transactions) {
            // eslint-disable-next-line unicorn/no-array-callback-reference
            pos = transaction.mapping.map(pos);
          }

          if (newNodes.length === 0) {
            tr.insert(pos, oldNode.node.copy());
            tr.setSelection(NodeSelection.create(tr.doc, pos));
            return tr;
          } else if (newNodes.length > 1) {
            for (const newNode of newNodes) {
              if (newNode.pos === pos) {
                continue;
              }

              tr.delete(newNode.pos, newNode.pos + newNode.node.nodeSize);
            }

            return tr;
          }
        },
      }),
    ];
  },
});
