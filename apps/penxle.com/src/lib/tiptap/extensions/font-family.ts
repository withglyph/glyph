import { Extension } from '@tiptap/core';
import { Heading, Paragraph } from '$lib/tiptap/nodes';
import type { FontFamily as TFontFamily } from '@penxle/lib/unocss';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (fontFamily: TFontFamily) => ReturnType;
    };
  }
}

const types = [Heading.name, Paragraph.name];

export const FontFamily = Extension.create({
  name: 'font_family',

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          'font-family': {
            default: 'sans',
            parseHTML: (element) => element.dataset.fontFamily,
            renderHTML: (attributes) => ({
              'data-font-family': attributes['font-family'] as string,
            }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily) =>
        ({ commands }) => {
          return types.every((type) => commands.updateAttributes(type, { 'font-family': fontFamily }));
        },
    };
  },
});
