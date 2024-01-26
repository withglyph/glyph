import type { Fragment, Node as ProsemirrorNode, NodeType } from '@tiptap/pm/model';

export function createCell(
  cellType: NodeType,
  cellContent?: Fragment | ProsemirrorNode | ProsemirrorNode[],
): ProsemirrorNode | null | undefined {
  if (cellContent) {
    return cellType.createChecked(null, cellContent);
  }

  return cellType.createAndFill();
}
