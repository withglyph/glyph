import { Extension } from '@tiptap/core';
import { Heading, Paragraph } from '$lib/tiptap/nodes';

// value reference from tailwind classnames: https://tailwindcss.com/docs/line-height
export type Height = 3 | 7 | 9 | 10 | 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (height: Height) => ReturnType;
    };
  }
}

const types = [Heading.name, Paragraph.name];

export const LineHeight = Extension.create({
  name: 'line_height',

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          'line-height': {
            default: 'normal',
            parseHTML: (element) => element.dataset.lineHeight,
            renderHTML: (attributes) => ({
              'data-line-height': attributes['line-height'] as string,
            }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (height) =>
        ({ commands }) => {
          return types.every((type) => commands.updateAttributes(type, { 'line-height': height }));
        },
    };
  },
});
