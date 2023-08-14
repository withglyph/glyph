import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    hardBreak: {
      setHardBreak: () => ReturnType;
    };
  }
}

export const HardBreak = Node.create({
  name: 'hard_break',
  group: 'inline',
  inline: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'br' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['br', HTMLAttributes];
  },

  renderText() {
    return '\n';
  },

  addCommands() {
    return {
      setHardBreak:
        () =>
        ({ commands, chain, state, editor }) => {
          if (commands.exitCode()) {
            return true;
          }

          if (state.selection.$from.parent.type.spec.isolating) {
            return false;
          }

          const currentMarks =
            state.storedMarks ?? state.selection.$from.marks();

          const marks = currentMarks.filter((mark) =>
            editor.extensionManager.splittableMarks.includes(mark.type.name),
          );

          return chain()
            .insertContent({ type: this.name })
            .command(({ tr }) => {
              tr.ensureMarks(marks);
              return true;
            })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Shift-Enter': () => this.editor.commands.setHardBreak(),
    };
  },
});
