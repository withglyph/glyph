import { Mark } from '@tiptap/core';
import Color from 'color';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    fontColor: {
      setFontColor: (fontColor: string) => ReturnType;
      unsetFontColor: () => ReturnType;
    };
  }
}

export const FontColor = Mark.create({
  name: 'font_color',
  priority: 120,

  addAttributes() {
    return {
      fontColor: {
        parseHTML: (element) => Color(element.style.color).hex().toLowerCase(),
        renderHTML: ({ fontColor }) => ({
          style: `color: ${fontColor}`,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span', getAttrs: (node) => !!(node as HTMLElement).style.color && null }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setFontColor:
        (fontColor) =>
        ({ commands }) => {
          if (!fontColor.startsWith('#')) {
            return false;
          }

          return commands.setMark(this.name, { fontColor: fontColor.toLowerCase() });
        },

      unsetFontColor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
