import { Extension } from '@tiptap/core';
import { dropCursor } from '@tiptap/pm/dropcursor';

export const DropCursor = Extension.create({
  name: 'drop_cursor',

  addProseMirrorPlugins() {
    return [
      dropCursor({
        class: 'prosemirror-drop-cursor',
        color: false,
        width: 4,
      }),
    ];
  },
});
