import { Node } from '@tiptap/core';

export const TableRow = Node.create<TableRowOptions>({
  name: 'tableRow',

  content: '(tableCell | tableHeader)*',

  tableRole: 'row',

  parseHTML() {
    return [{ tag: 'tr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', HTMLAttributes, 0];
  },
});
