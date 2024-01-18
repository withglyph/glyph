import { Node } from '@tiptap/core';

type Kind = 1 | 2 | 3;

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    blockQuote: {
      setBlockquote: (kind: Kind) => ReturnType;
      toggleBlockquote: (kind: Kind) => ReturnType;
      unsetBlockquote: () => ReturnType;
    };
  }
}

export const inputRegex = /^\s*>\s$/;

export const Blockquote = Node.create({
  name: 'blockquote',
  content: 'prose+',
  group: 'block',
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: 1,
        parseHTML: (element) => element.dataset.kind,
        renderHTML: (attributes: { kind: Kind }) => {
          const align = attributes.kind === 3 ? { 'data-text-align': 'center' } : {};

          return { 'data-kind': attributes.kind.toString(), ...align };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'blockquote' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setBlockquote:
        (kind) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { kind });
        },
      toggleBlockquote:
        (kind) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { kind });
        },
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(1),
    };
  },
});
