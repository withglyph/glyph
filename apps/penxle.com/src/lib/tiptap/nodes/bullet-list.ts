import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    bulletList: {
      toggleBulletList: () => ReturnType;
    };
  }
}

export const BulletList = Node.create({
  name: 'bullet_list',
  group: 'block',
  content: 'list_item+',

  parseHTML() {
    return [{ tag: 'ul' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      toggleBulletList:
        () =>
        ({ commands }) => {
          return commands.toggleList(this.name, 'list_item');
        },
    };
  },
});
