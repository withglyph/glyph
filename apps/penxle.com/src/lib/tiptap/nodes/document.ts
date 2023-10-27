import { Node } from '@tiptap/core';

export const Document = Node.create({
  name: 'document',
  topNode: true,

  content() {
    return this.editor?.isEditable ? 'block+ (access_barrier block+)?' : 'block+ access_barrier? block*';
  },
});
