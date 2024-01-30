import { Extension } from '@tiptap/core';
import clsx from 'clsx';
import { Paragraph } from '../nodes';
import { LegacyHeading } from './heading';

export const LegacyTextAlign = Extension.create({
  name: 'legacy_text_align',

  addGlobalAttributes() {
    return [
      {
        types: [LegacyHeading.name, Paragraph.name],
        attributes: {
          'text-align': {
            default: undefined,
            renderHTML: ({ 'text-align': textAlign }) => ({
              class: clsx(
                textAlign === 'left' && 'text-left',
                textAlign === 'center' && 'text-center',
                textAlign === 'right' && 'text-right',
                textAlign === 'justify' && 'text-justify',
              ),
            }),
          },
        },
      },
    ];
  },
});
