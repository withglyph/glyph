import { Node } from '@tiptap/core';
import { browser } from '$app/environment';
import { SvelteNodeViewRenderer } from './renderer';
import type { NodeConfig } from '@tiptap/core';
import type { NodeViewComponentType } from './renderer';

type CreateNodeViewOptions = NodeConfig;

export const createNodeView = (component: NodeViewComponentType, options: CreateNodeViewOptions) => {
  return Node.create({
    ...options,

    parseHTML() {
      return [{ tag: 'node-view' }];
    },

    renderHTML({ node }) {
      if (browser) {
        return ['node-view'];
      } else {
        // @ts-expect-error svelte internal
        const { html } = component.render({
          node,
          extension: this,
          selected: false,
        });

        return ['node-view', { html }];
      }
    },

    addNodeView() {
      return SvelteNodeViewRenderer(component);
    },
  });
};
