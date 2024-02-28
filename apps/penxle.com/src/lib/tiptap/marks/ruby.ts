import { Mark, mergeAttributes } from '@tiptap/core';
import { css } from '$styled-system/css';

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
        class: css({
          position: 'relative',
          display: 'inline-block',
          lineHeight: '[1]',
          textIndent: '0',
          _after: {
            content: 'attr(data-ruby)',
            position: 'absolute',
            top: '0',
            display: 'block',
            width: 'max',
            minWidth: 'full',
            textAlign: 'center',
            fontSize: '[0.75em]',
            lineHeight: '[1]',
            translate: 'auto',
            translateY: '[-100%]',
            pointerEvents: 'none',
            userSelect: 'none',
          },
        }),
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
