import { Mark, mergeAttributes } from '@tiptap/core';
import { css } from '$styled-system/css';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    italic: {
      toggleItalic: () => ReturnType;
    };
  }
}

export const Italic = Mark.create({
  name: 'italic',

  parseHTML() {
    return [{ tag: 'i' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['i', mergeAttributes(HTMLAttributes, { class: css({ fontStyle: 'italic' }) }), 0];
  },

  addCommands() {
    return {
      toggleItalic:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-i': () => this.editor.commands.toggleItalic(),
    };
  },
});
