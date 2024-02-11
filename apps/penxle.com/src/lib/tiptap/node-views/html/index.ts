import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    html: {
      setHtml: () => ReturnType;
    };
  }
}

export const Html = createNodeView(Component, {
  name: 'html',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      content: {
        default: '',
      },
    };
  },

  addCommands() {
    return {
      setHtml:
        () =>
        ({ tr }) => {
          tr.replaceSelectionWith(this.type.create());
          return tr.docChanged;
        },
    };
  },
});
