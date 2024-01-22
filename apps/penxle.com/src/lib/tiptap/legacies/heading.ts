import { mergeAttributes, Node } from '@tiptap/core';
import clsx from 'clsx';

export const LegacyHeading = Node.create({
  name: 'heading',
  group: 'block',
  content: 'text*',
  defining: true,

  addAttributes() {
    return {
      level: {
        renderHTML: ({ level }) => ({
          class: clsx(level === 1 && 'title-24-b', level === 2 && 'title-20-b', level === 3 && 'subtitle-18-b'),
        }),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return [`h${node.attrs.level}`, mergeAttributes(HTMLAttributes, { class: 'my-4' }), 0];
  },
});
