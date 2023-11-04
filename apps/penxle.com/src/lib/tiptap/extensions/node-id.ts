import { combineTransactionSteps, Extension, findChildren, findChildrenInRange, getChangedRanges } from '@tiptap/core';
import { Plugin, Transaction } from '@tiptap/pm/state';
import { nanoid } from 'nanoid';

const types = new Set(['paragraph']);

export const NodeId = Extension.create({
  name: 'node_id',
  priority: 255,

  addGlobalAttributes() {
    return [
      {
        types: ['block'],
        attributes: {
          'node-id': {
            default: null,
          },
        },
      },
    ];
  },

  onCreate() {
    const { doc, tr } = this.editor.state;

    const nodes = findChildren(doc, (node) => types.has(node.type.name) && node.attrs['node-id'] === null);
    for (const { pos } of nodes) {
      tr.setNodeAttribute(pos, 'node-id', nanoid());
    }

    tr.setMeta('addToHistory', false);
    this.editor.view.dispatch(tr);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some((t) => t.docChanged) && !oldState.doc.eq(newState.doc);
          if (!docChanged) {
            return;
          }

          const { tr, doc } = newState;

          const transform = combineTransactionSteps(oldState.doc, transactions as Transaction[]);
          const changes = getChangedRanges(transform);

          for (const { newRange } of changes) {
            const nodes = findChildrenInRange(doc, newRange, (node) => !node.isText);
            const ids: string[] = [];

            for (const { node, pos } of nodes) {
              const id = node.attrs['node-id'];

              if (id === null) {
                tr.setNodeAttribute(pos, 'node-id', nanoid());
                continue;
              }

              if (ids.includes(id)) {
                tr.setNodeAttribute(pos, 'node-id', nanoid());
              }

              ids.push(id);
            }
          }

          return tr;
        },
      }),
    ];
  },
});
