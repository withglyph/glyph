import { Node } from '@tiptap/core';
import { browser } from '$app/environment';
import { SvelteNodeViewRenderer } from './renderer';
import type { NodeConfig } from '@tiptap/core';
import type { NodeViewComponentType } from './renderer';

type CreateNodeViewOptions<Options, Storage> = NodeConfig<Options, Storage>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createNodeView = <Options = any, Storage = any>(
  component: NodeViewComponentType,
  options: CreateNodeViewOptions<Options, Storage>,
) => {
  return Node.create<Options, Storage>({
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

        return ['node-view', { html, style: 'white-space: normal;' }];
      }
    },

    addNodeView() {
      return SvelteNodeViewRenderer(component);
    },
  });
};
