import { Node } from '@tiptap/core';

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
  group: 'block',
  content: 'list_item+',

  parseHTML() {
    return [{ tag: 'ol' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ol', HTMLAttributes, 0];
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
