import { Extension } from '@tiptap/core';
import clsx from 'clsx';
import { Paragraph } from '$lib/tiptap/nodes';
import { LegacyHeading } from './heading';

const types = [LegacyHeading.name, Paragraph.name];

export const LegacyFontFamily = Extension.create({
  name: 'legacy_font_family',

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          'font-family': {
            default: undefined,
            renderHTML: ({ 'font-family': fontFamily }) => ({
              class: clsx(
                fontFamily === 'sans' && 'font-sans',
                fontFamily === 'serif' && 'font-serif',
                fontFamily === 'serif2' && 'font-serif2',
                fontFamily === 'serif3' && 'font-serif3',
                fontFamily === 'mono' && 'font-mono',
              ),
            }),
          },
        },
      },
    ];
  },
});
