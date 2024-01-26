import { mergeAttributes, Node } from '@tiptap/core';

export type TableRowOptions = {
  HTMLAttributes: Record<string, unknown>;
};

export const TableRow = Node.create<TableRowOptions>({
  name: 'tableRow',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: '(tableCell | tableHeader)*',

  tableRole: 'row',

  parseHTML() {
    return [{ tag: 'tr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
