import { Node } from '@tiptap/core';

export const Document = Node.create({
  name: 'document',
  content: 'block+',
  topNode: true,
});
