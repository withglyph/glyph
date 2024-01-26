import { mergeAttributes, Node } from '@tiptap/core';

export const TableHeader = Node.create<TableHeaderOptions>({
  name: 'tableHeader',

  content: 'block+',

  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute('colwidth');
          const value = colwidth ? [Number.parseInt(colwidth, 10)] : null;

          return value;
        },
      },
    };
  },

  tableRole: 'header_cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'th' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'th',
      mergeAttributes(HTMLAttributes, {
        class: 'relative vertical-top min-w-1em px-3 py-5 border-(1px solid block) bg-primary font-bold',
      }),
      0,
    ];
  },
});
