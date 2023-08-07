import { Plugin } from '@tiptap/pm/state';
import { findChildrenByType } from 'prosemirror-utils';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line typescript/consistent-type-definitions
  interface Commands<ReturnType> {
    accessBarrier: {
      setAccessBarrier: () => ReturnType;
    };
  }
}

export const AccessBarrier = createNodeView(Component, {
  name: 'access_barrier',
  draggable: true,
  selectable: false,

  addAttributes() {
    return {
      deleting: {},
    };
  },

  addCommands() {
    return {
      setAccessBarrier:
        () =>
        ({ tr }) => {
          tr.insert(tr.selection.$to.end(), this.type.create());
          return tr.docChanged;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_, oldState, newState) => {
          // state 탐색해서 document 전 후 비교함
          const [before] = findChildrenByType(oldState.doc, this.type, false);
          const [after] = findChildrenByType(newState.doc, this.type, false);

          // 있었는데요 없었습니다 (access_barrier 삭제됨)
          if (before && !after) {
            // 컴포넌트 핸들러 통해서 직접 삭제하는 중
            if (before.node.attrs.deleting) {
              return null;
            }

            // 같은 위치에 재생성함
            return newState.tr.replaceSelectionWith(this.type.create());
          }

          return null;
        },
      }),
    ];
  },
});
