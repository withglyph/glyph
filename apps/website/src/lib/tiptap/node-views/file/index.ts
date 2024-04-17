import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { nanoid } from 'nanoid';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    file: {
      setFile: (file: File) => ReturnType;
    };
  }
}

type Storage = {
  files: Record<string, File>;
};

export const File = createNodeView<never, Storage>(Component, {
  name: 'file',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      id: {},
      ephemeralId: {},
    };
  },

  onCreate() {
    this.storage.files = {};
  },

  addCommands() {
    return {
      setFile:
        (file) =>
        ({ state, tr }) => {
          const { selection } = state;
          const { $to } = selection;

          const pos = selection instanceof TextSelection ? $to.end() + 1 : $to.pos;

          const key = nanoid();
          this.storage.files[key] = file;

          tr.insert(pos, this.type.create({ key }));
          tr.setSelection(NodeSelection.create(tr.doc, pos));
          tr.scrollIntoView();

          return tr.docChanged;
        },
    };
  },
});
