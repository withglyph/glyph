import { Node } from '@tiptap/core';

export const ListItem = Node.create({
  name: 'list_item',
  content: 'paragraph block*',
  defining: true,

  parseHTML() {
    return [{ tag: 'li' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', HTMLAttributes, 0];
  },

  addKeyboardShortcuts() {
    return {
      'Enter': () => this.editor.commands.splitListItem(this.name),
      'Tab': () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    };
  },
});
