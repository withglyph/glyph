import { Extension } from '@tiptap/core';
import clsx from 'clsx';
import { Paragraph } from '$lib/tiptap/nodes';
import { LegacyHeading } from './heading';

// value reference from classname: https://tailwindcss.com/docs/letter-spacing
const types = [LegacyHeading.name, Paragraph.name];

export const LegacyLetterSpacing = Extension.create({
  name: 'legacy_letter_spacing',

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          'letter-spacing': {
            default: undefined,
            renderHTML: ({ 'letter-spacing': letterSpacing }) => ({
              class: clsx(
                letterSpacing === 'tighter' && 'tracking-tighter',
                letterSpacing === 'tight' && 'tracking-tight',
                letterSpacing === 'normal' && 'tracking-normal',
                letterSpacing === 'wide' && 'tracking-wide',
                letterSpacing === 'wider' && 'tracking-wider',
                letterSpacing === 'widest' && 'tracking-widest',
              ),
            }),
          },
        },
      },
    ];
  },
});
