<script lang="ts">
  import { NodeView } from '$lib/tiptap';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let editor: NodeViewProps['editor'] | undefined;
</script>

<NodeView class="flex center p-4 relative">
  <button
    class="h-full text-center w-2rem bg-[rgba(33,33,33,0.1)] top-0 right-0 absolute"
    type="button"
    on:click={editor?.commands.addColumnAfter}
  >
    +
  </button>
  <div data-node-view-content />
  <button
    class="w-full text-center h-2rem bg-[rgba(33,33,33,0.1)]"
    type="button"
    on:click={editor?.commands.addRowAfter}
  >
    +
  </button>
</NodeView>
