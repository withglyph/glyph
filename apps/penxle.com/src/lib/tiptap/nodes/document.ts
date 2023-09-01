import { Node } from '@tiptap/core';

export const Document = Node.create({
  name: 'document',
  content: 'block+ (access_barrier block+)?',
  topNode: true,
});
