import { Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from './renderer';
import type { NodeViewComponentType } from './renderer';
import type { NodeConfig } from '@tiptap/core';

type CreateNodeViewOptions = NodeConfig;

export const createNodeView = (
  component: NodeViewComponentType,
  options: CreateNodeViewOptions,
) => {
  return Node.create({
    ...options,

    parseHTML() {
      return [{ tag: 'node-view' }];
    },

    renderHTML() {
      return ['node-view'];
    },

    addNodeView() {
      return SvelteNodeViewRenderer(component);
    },
  });
};
