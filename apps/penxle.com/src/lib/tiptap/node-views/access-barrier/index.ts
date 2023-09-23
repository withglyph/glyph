import { Plugin } from '@tiptap/pm/state';
import { findChildrenByType } from 'prosemirror-utils';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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
        filterTransaction: (tr) => {
          // 기존 document에 access_barrier 있었는지 확인함
          const [child] = findChildrenByType(tr.before, this.type, false);

          // 기존 document에 존재함
          if (child) {
            // 트랜잭션 적용해서 삭제 여부 확인 & 새 포지션 계산함
            const r = tr.mapping.mapResult(child.pos);

            // 있었는데요 없었습니다 (access_barrier 삭제됨)
            // 컴포넌트 핸들러 통해서 직접 삭제하는거 아님
            // history 플러그인 통해서 undo/redo 하는거 아님
            if (r.deleted && !child.node.attrs.deleting && !tr.getMeta('history$')) {
              // 같은 위치에 재생성함
              tr.insert(r.pos, this.type.create());
            }
          }

          return true;
        },
      }),
    ];
  },
});
