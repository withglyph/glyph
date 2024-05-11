import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { createEmptyTiptapDocumentNode } from '$lib/utils';
import { css } from '$styled-system/css';

export const Placeholder = Extension.create({
  name: 'placeholder',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, schema }) => {
            if (!this.editor.isEditable) {
              return;
            }

            const emptyDocument = createEmptyTiptapDocumentNode(schema);

            if (
              doc.sameMarkup(emptyDocument) &&
              doc.content.findDiffStart(emptyDocument.content) === null &&
              doc.firstChild?.firstChild
            ) {
              return DecorationSet.create(doc, [
                Decoration.node(1, doc.firstChild.firstChild.nodeSize + 1, {
                  'class': css({
                    _before: {
                      content: 'attr(data-placeholder)',
                      float: '[left]',
                      height: '0',
                      color: 'gray.400',
                      pointerEvents: 'none',
                    },
                  }),
                  'data-placeholder': '내용을 입력하세요',
                }),
              ]);
            }
          },
        },
      }),
    ];
  },
});
