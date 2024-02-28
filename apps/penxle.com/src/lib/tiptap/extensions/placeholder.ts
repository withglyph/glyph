import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
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

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const emptyDocument = doc.type.createAndFill(null, [
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              schema.nodes.paragraph.createAndFill()!,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              schema.nodes.access_barrier.createAndFill()!,
            ])!;
            if (
              doc.sameMarkup(emptyDocument) &&
              doc.content.findDiffStart(emptyDocument.content) === null &&
              doc.firstChild
            ) {
              return DecorationSet.create(doc, [
                Decoration.node(0, doc.firstChild.nodeSize, {
                  'class': css({
                    _before: {
                      content: 'attr(data-placeholder)',
                      float: 'left',
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
