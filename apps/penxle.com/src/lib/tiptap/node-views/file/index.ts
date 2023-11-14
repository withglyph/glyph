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

export const File = createNodeView(Component, {
  name: 'file',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      id: {},
      __data: { default: undefined },
      __file: { default: undefined },
    };
  },

  addCommands() {
    return {
      setFile:
        (file) =>
        ({ tr }) => {
          tr.replaceSelectionWith(this.type.create({ __file: file }));
          return tr.docChanged;
        },
    };
  },
});
