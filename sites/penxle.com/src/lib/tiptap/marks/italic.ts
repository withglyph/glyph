import { Mark } from '@tiptap/core';

declare module '@tiptap/core' {
  // eslint-disable-next-line typescript/consistent-type-definitions
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

  renderHTML() {
    return ['i', 0];
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
