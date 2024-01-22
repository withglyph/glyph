import { Mark } from '@tiptap/core';
import { values } from '$lib/tiptap/values';
import { closest } from '$lib/utils';

const fontSizes = values.fontSize.map(({ value }) => value);

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: number) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Mark.create({
  name: 'font_size',
  priority: 120,

  addAttributes() {
    return {
      fontSize: {
        parseHTML: (element) => {
          const fontSize = Number.parseFloat(element.style.fontSize.replace(/rem$/, '')) * 16;
          return closest(fontSize, fontSizes);
        },
        renderHTML: ({ fontSize }) => ({
          style: `font-size: ${fontSize / 16}rem`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => (element as HTMLElement).style.fontSize.endsWith('rem') && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ commands }) => {
          return commands.setMark(this.name, { fontSize: closest(fontSize, fontSizes) });
        },

      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
