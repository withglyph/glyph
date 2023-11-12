import { Extension } from '@tiptap/core';
import { Heading, Paragraph } from '$lib/tiptap/nodes';

// value reference from classname: https://tailwindcss.com/docs/letter-spacing
export type Spacing = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    letterSpacing: {
      setLetterSpacing: (spacing: Spacing) => ReturnType;
    };
  }
}

const types = [Heading.name, Paragraph.name];

export const LetterSpacing = Extension.create({
  name: 'letter_spacing',

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          'letter-spacing': {
            default: 'normal',
            parseHTML: (element) => element.dataset.letterSpacing,
            renderHTML: (attributes) => ({
              'data-letter-spacing': attributes['letter-spacing'] as string,
            }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLetterSpacing:
        (height) =>
        ({ commands }) => {
          return types.every((type) => commands.updateAttributes(type, { 'letter-spacing': height }));
        },
    };
  },
});
