import { Extension } from '@tiptap/core';
import clsx from 'clsx';
import { Paragraph } from '$lib/tiptap/nodes';
import { LegacyHeading } from './heading';

const types = [LegacyHeading.name, Paragraph.name];

export const LegacyLineHeight = Extension.create({
  name: 'legacy_line_height',

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          'line-height': {
            default: undefined,
            renderHTML: ({ 'line-height': lineHeight }) => ({
              class: clsx(
                lineHeight === 'none' && 'leading-4',
                lineHeight === 'tight' && 'leading-5',
                lineHeight === 'snug' && 'leading-6',
                lineHeight === 'normal' && 'leading-7',
                lineHeight === 'relaxed' && 'leading-8',
                lineHeight === 'loose' && 'leading-9',
              ),
            }),
          },
        },
      },
    ];
  },
});
