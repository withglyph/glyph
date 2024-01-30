import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    ruby: {
      setRuby: (text: string) => ReturnType;
      updateRuby: (text: string) => ReturnType;
      unsetRuby: () => ReturnType;
    };
  }
}

export const inputRegex = /^\s*>\s$/;

export const Ruby = Mark.create({
  name: 'ruby',
  priority: 110,
  inclusive: false,

  addAttributes() {
    return {
      text: {
        parseHTML: (element) => element.dataset.ruby,
        renderHTML: ({ text }) => {
          return { 'data-ruby': text };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-ruby]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class:
          'inline-block relative indent-0 line-height-[1] after:(block absolute top-0 -translate-y-full text-0.75em text-center line-height-[1] min-w-full w-max content-[attr(data-ruby)] select-none pointer-events-none)',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setRuby:
        (text) =>
        ({ commands }) => {
          return commands.setMark(this.name, { text });
        },

      updateRuby:
        (text) =>
        ({ chain }) => {
          return chain().extendMarkRange(this.name).updateAttributes(this.name, { text }).run();
        },

      unsetRuby:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name, { extendEmptyMarkRange: true });
        },
    };
  },
});
