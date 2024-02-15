<script lang="ts">
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import Editor from './Editor.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let getPos: NodeViewProps['getPos'];
  export let deleteNode: NodeViewProps['deleteNode'];
  // export let updateAttributes: NodeViewProps['updateAttributes'];

  let open = false;
</script>

<NodeView class="flex center py-12px border-4 border-dotted border-teal-500 rounded-xl" data-drag-handle draggable>
  Gallery
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button class="p-4px rounded-2px transition hover:bg-gray-100" type="button" on:click={() => (open = true)}>
      <i class="i-tb-edit text-gray-600 square-18px block <sm:square-20px" />
    </button>

    <div class="w-1px h-12px bg-gray-200" />

    <button class="p-4px rounded-2px transition hover:bg-gray-100" type="button" on:click={() => deleteNode()}>
      <i class="i-tb-trash text-gray-600 square-18px block" />
    </button>
  </TiptapNodeViewBubbleMenu>

  <Editor bind:open />
{/if}
