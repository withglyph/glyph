import { Extension } from '@tiptap/core';
import { gapCursor } from '@tiptap/pm/gapcursor';

export const GapCursor = Extension.create({
  name: 'gap_cursor',

  addProseMirrorPlugins() {
    return [gapCursor()];
  },
});
