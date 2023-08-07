import { Extension } from '@tiptap/core';
import { history, redo, undo } from '@tiptap/pm/history';

declare module '@tiptap/core' {
  // eslint-disable-next-line typescript/consistent-type-definitions
  interface Commands<ReturnType> {
    history: {
      undo: () => ReturnType;
      redo: () => ReturnType;
    };
  }
}

export const History = Extension.create({
  name: 'history',

  addCommands() {
    return {
      undo:
        () =>
        ({ state, dispatch }) => {
          return undo(state, dispatch);
        },
      redo:
        () =>
        ({ state, dispatch }) => {
          return redo(state, dispatch);
        },
    };
  },

  addProseMirrorPlugins() {
    return [history()];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    };
  },
});
