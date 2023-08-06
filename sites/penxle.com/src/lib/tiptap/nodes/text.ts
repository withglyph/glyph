import { Node } from '@tiptap/core';

export const Text = Node.create({
  name: 'text',
  group: 'inline',
  inline: true,
  priority: 255,
});
