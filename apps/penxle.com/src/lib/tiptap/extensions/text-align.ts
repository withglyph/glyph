import { Extension } from '@tiptap/core';

type Alignment = 'left' | 'center' | 'right' | 'justify';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: Alignment) => ReturnType;
    };
  }
}

export const TextAlign = Extension.create({
  name: 'text_align',

  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          'text-align': {
            default: 'left',
            parseHTML: (element) => element.dataset.textAlign,
            renderHTML: (attributes) => ({
              'data-text-align': attributes['text-align'] as string,
            }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) => {
          return ['heading', 'paragraph'].every((type) => commands.updateAttributes(type, { 'text-align': alignment }));
        },
    };
  },
});
