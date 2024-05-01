import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    file: {
      setFile: (id: string) => ReturnType;
    };
  }
}

export const File = createNodeView(Component, {
  name: 'file',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      id: { isRequired: true },
    };
  },

  onCreate() {
    this.storage.files = {};
  },

  addCommands() {
    return {
      setFile:
        (id) =>
        ({ state, tr }) => {
          const { selection } = state;
          const { $to } = selection;

          const pos = selection instanceof TextSelection ? $to.end() + 1 : $to.pos;

          tr.insert(pos, this.type.create({ id }));
          tr.setSelection(NodeSelection.create(tr.doc, pos));
          tr.scrollIntoView();

          return tr.docChanged;
        },
    };
  },
});
