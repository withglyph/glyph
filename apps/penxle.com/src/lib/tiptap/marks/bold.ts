import { Mark, mergeAttributes } from '@tiptap/core';
import { css } from '$styled-system/css';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    bold: {
      toggleBold: () => ReturnType;
    };
  }
}

export const Bold = Mark.create({
  name: 'bold',

  parseHTML() {
    return [{ tag: 'b' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['b', mergeAttributes(HTMLAttributes, { class: css({ fontWeight: 'bold' }) }), 0];
  },

  addCommands() {
    return {
      toggleBold:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
    };
  },
});
