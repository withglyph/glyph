import { Mark } from '@tiptap/core';
import clsx from 'clsx';

export const LegacyTextColor = Mark.create({
  name: 'text-color',

  addAttributes() {
    return {
      'data-text-color': {
        renderHTML: ({ 'data-text-color': textColor }) => ({
          class: clsx(
            (textColor === 'text-gray-50' || textColor === 'text-post-gray') && 'text-post-gray',
            (textColor === 'text-gray-40' || textColor === 'text-post-gray2' || textColor === 'text-post-lightgray') &&
              'text-post-lightgray',
            (textColor === 'text-red-60' || textColor === 'text-post-red') && 'text-post-red',
            (textColor === 'text-blue-60' || textColor === 'text-post-blue') && 'text-post-blue',
            (textColor === 'text-orange-70' || textColor === 'text-post-brown') && 'text-post-brown',
            (textColor === 'text-green-60' || textColor === 'text-post-green') && 'text-post-green',
            (textColor === 'text-purple-60' || textColor === 'text-post-purple') && 'text-post-purple',
            (textColor === 'text-white' || textColor === 'text-post-white') && 'text-post-white',
          ),
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },
});
