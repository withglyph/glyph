import { Mark } from '@tiptap/core';
import { values } from '$lib/tiptap/values';

const fontFamilies = values.fontFamily.map(({ value }) => value);
type FontFamily = (typeof fontFamilies)[number];

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (fontFamily: FontFamily) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

export const FontFamily = Mark.create({
  name: 'font_family',
  priority: 120,

  addAttributes() {
    return {
      fontFamily: {
        parseHTML: (element) => element.style.fontFamily.replace(/^PNXL_/, ''),
        renderHTML: ({ fontFamily }) => ({
          style: `font-family: PNXL_${fontFamily}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (node) => {
          const fontFamily = (node as HTMLElement).style.fontFamily.replace(/^PNXL_/, '');

          if ((fontFamilies as string[]).includes(fontFamily)) {
            return null;
          }

          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily) =>
        ({ commands }) => {
          if (!fontFamilies.includes(fontFamily)) {
            return false;
          }

          return commands.setMark(this.name, { fontFamily });
        },

      unsetFontFamily:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
