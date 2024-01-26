<script lang="ts">
  import { NodeView, NodeViewContentEditable } from '$lib/tiptap';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let editor: NodeViewProps['editor'] | undefined;
</script>

<NodeView class="w-fit p-4 relative">
  <button
    class="h-full text-center w-1rem bg-[rgba(33,33,33,0.1)] right-0 absolute"
    type="button"
    on:click={editor?.commands.addColumnAfter}
  >
    +
  </button>
  <NodeViewContentEditable />
  <button
    class="absolute bottom-0 w-full text-center h-1rem bg-[rgba(33,33,33,0.1)]"
    type="button"
    on:click={editor?.commands.addRowAfter}
  >
    +
  </button>
</NodeView>
