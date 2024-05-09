import { createNodeView } from '$lib/tiptap';
import Component from './Component.svelte';

export const Gallery = createNodeView(Component, {
  name: 'gallery',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      ids: {},
      size: { default: 'full' },
      align: { default: 'center' },
      layout: { default: 'scroll' },
    };
  },
});
