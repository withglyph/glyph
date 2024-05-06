import { getNodeAtPosition, isAtEndOfNode, isAtStartOfNode, isNodeActive, Node } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';

const findListItemPos = (state: EditorState) => {
  const { $from } = state.selection;

  let currentNode = null;
  let currentDepth = $from.depth;
  let currentPos = $from.pos;
  let targetDepth: number | null = null;

  while (currentDepth > 0 && targetDepth === null) {
    currentNode = $from.node(currentDepth);

    if (currentNode.type.name === 'list_item') {
      targetDepth = currentDepth;
    } else {
      currentDepth -= 1;
      currentPos -= 1;
    }
  }

  if (targetDepth === null) {
    return null;
  }

  return { $pos: state.doc.resolve(currentPos), depth: targetDepth };
};

const getNextListDepth = (state: EditorState) => {
  const listItemPos = findListItemPos(state);

  if (!listItemPos) {
    return null;
  }

  const [, depth] = getNodeAtPosition(state, 'list_item', listItemPos.$pos.pos + 4);

  return depth;
};

const hasListBefore = (state: EditorState) => {
  const { $anchor } = state.selection;

  const previousNodePos = Math.max(0, $anchor.pos - 2);

  const previousNode = state.doc.resolve(previousNodePos).node();

  return previousNode && ['bullet_list', 'ordered_list'].includes(previousNode.type.name);
};

const hasListItemBefore = (state: EditorState): boolean => {
  const { $anchor } = state.selection;

  const $targetPos = state.doc.resolve($anchor.pos - 2);

  if ($targetPos.index() === 0) {
    return false;
  }

  return $targetPos.nodeBefore?.type.name === 'list_item';
};

const listItemHasSubList = (node?: ProseMirrorNode) => {
  if (!node) {
    return false;
  }

  let hasSubList = false;

  node.descendants((child) => {
    if (child.type.name === 'list_item') {
      hasSubList = true;
    }
  });

  return hasSubList;
};

export const ListItem = Node.create({
  name: 'list_item',
  content: 'paragraph{1,2} list*',
  defining: true,

  parseHTML() {
    return [{ tag: 'li' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', HTMLAttributes, 0];
  },

  addKeyboardShortcuts() {
    return {
      'Enter': () => this.editor.commands.splitListItem(this.name),
      'Tab': () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),

      'Backspace': () => {
        if (!isNodeActive(this.editor.state, this.type) && hasListBefore(this.editor.state)) {
          const { $anchor } = this.editor.state.selection;

          const $listPos = this.editor.state.doc.resolve($anchor.before() - 1);

          const listDescendants: { node: ProseMirrorNode; pos: number }[] = [];

          $listPos.node().descendants((node, pos) => {
            if (node.type === this.type) {
              listDescendants.push({ node, pos });
            }
          });

          const lastItem = listDescendants.at(-1);

          if (!lastItem) {
            return false;
          }

          const $lastItemPos = this.editor.state.doc.resolve($listPos.start() + lastItem.pos + 1);

          return this.editor
            .chain()
            .cut({ from: $anchor.start() - 1, to: $anchor.end() + 1 }, $lastItemPos.end())
            .joinForward()
            .run();
        }

        if (!isNodeActive(this.editor.state, this.type)) {
          return false;
        }

        if (!isAtStartOfNode(this.editor.state)) {
          return false;
        }

        const listItemPos = findListItemPos(this.editor.state);

        if (!listItemPos) {
          return false;
        }

        const $prev = this.editor.state.doc.resolve(listItemPos.$pos.pos - 2);
        const prevNode = $prev.node(listItemPos.depth);

        const previousListItemHasSubList = listItemHasSubList(prevNode);

        if (hasListItemBefore(this.editor.state) && !previousListItemHasSubList) {
          return this.editor.commands.joinItemBackward();
        }

        return this.editor.chain().liftListItem(this.type).run();
      },
      'Mod-Backspace': () => {
        return this.editor.commands.keyboardShortcut('Backspace');
      },

      'Delete': () => {
        if (!isNodeActive(this.editor.state, this.type)) {
          return false;
        }

        if (!isAtEndOfNode(this.editor.state, this.type.name)) {
          return false;
        }

        const listDepth = getNextListDepth(this.editor.state);
        const listItemPos = findListItemPos(this.editor.state);

        if (listItemPos && listDepth) {
          if (listDepth > listItemPos.depth) {
            return this.editor
              .chain()
              .focus(this.editor.state.selection.from + 4)
              .lift(this.type)
              .joinBackward()
              .run();
          }

          if (listDepth < listItemPos.depth) {
            return this.editor.chain().joinForward().joinBackward().run();
          }
        }

        return this.editor.commands.joinItemForward();
      },
      'Mod-Delete': () => {
        return this.editor.commands.keyboardShortcut('Delete');
      },
    };
  },
});
