import { Mark } from '@tiptap/core';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    strike: {
      toggleStrike: () => ReturnType;
    };
  }
}

export const Strike = Mark.create({
  name: 'strike',

  parseHTML() {
    return [{ tag: 's' }];
  },

  renderHTML() {
    return ['s', 0];
  },

  addCommands() {
    return {
      toggleStrike:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-s': () => this.editor.commands.toggleStrike(),
    };
  },
});
