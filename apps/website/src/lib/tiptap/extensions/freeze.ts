import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

export const Freeze = Extension.create({
  name: 'freeze',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction: (tr) => {
          return tr.getMeta('ignoreFreezing') || !tr.docChanged;
        },
      }),
    ];
  },
});
