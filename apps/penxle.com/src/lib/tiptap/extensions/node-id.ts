import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { nanoid } from 'nanoid';

const types = new Set(['paragraph']);

export const NodeId = Extension.create({
  name: 'node_id',

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          'node-id': {
            rendered: false,
            keepOnSplit: false,
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_, __, newState) => {
          const { tr, doc } = newState;

          doc.descendants((node, pos) => {
            if (types.has(node.type.name) && !node.attrs['node-id']) {
              tr.setNodeAttribute(pos, 'node-id', nanoid());
            }

            return true;
          });

          return tr;
        },
      }),
    ];
  },
});
