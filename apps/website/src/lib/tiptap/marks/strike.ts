import { Mark, mergeAttributes } from '@tiptap/core';
import { css } from '$styled-system/css';

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

  renderHTML({ HTMLAttributes }) {
    return ['s', mergeAttributes(HTMLAttributes, { class: css({ textDecorationLine: 'line-through' }) }), 0];
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
