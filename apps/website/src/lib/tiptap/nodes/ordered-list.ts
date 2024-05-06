import { mergeAttributes, Node } from '@tiptap/core';
import { css } from '$styled-system/css';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    orderedList: {
      toggleOrderedList: () => ReturnType;
    };
  }
}

export const OrderedList = Node.create({
  name: 'ordered_list',
  group: 'block list',
  content: 'list_item+',

  parseHTML() {
    return [{ tag: 'ol' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ol',
      mergeAttributes(HTMLAttributes, {
        class: css({ marginLeft: '20px', listStylePosition: 'outside', listStyleType: 'decimal' }),
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleOrderedList:
        () =>
        ({ commands }) => {
          return commands.toggleList(this.name, 'list_item');
        },
    };
  },
});
