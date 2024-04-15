import { Node } from '@tiptap/core';

export const Document = Node.create({
  name: 'document',
  topNode: true,
  content: 'block+',
});
