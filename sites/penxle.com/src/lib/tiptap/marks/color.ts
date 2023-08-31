import { Mark } from '@tiptap/core';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    color: {
      setColor: (attributes: { 'data-color': string }) => ReturnType;
      unsetColor: () => ReturnType;
    };
  }
}

export const Color = Mark.create({
  name: 'color',

  addAttributes() {
    return {
      'data-color': {
        rendered: true,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setColor:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetColor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
