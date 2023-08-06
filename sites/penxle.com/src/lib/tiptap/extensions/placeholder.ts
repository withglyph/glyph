import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const Placeholder = Extension.create({
  name: 'placeholder',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('placeholder'),
        props: {
          decorations: ({ doc }) => {
            if (!this.editor.isEditable) {
              return null;
            }

            let decoration: Decoration | null = null;

            const emptyDocument = doc.type.createAndFill()!;
            if (doc.sameMarkup(emptyDocument)) {
              doc.descendants((node, pos) => {
                decoration = Decoration.node(pos, pos + node.nodeSize, {
                  'class': 'is-editor-empty',
                  'data-placeholder': '내용을 입력하세요.',
                });
              });
            }

            if (!decoration) {
              return null;
            }

            return DecorationSet.create(doc, [decoration]);
          },
        },
      }),
    ];
  },
});
