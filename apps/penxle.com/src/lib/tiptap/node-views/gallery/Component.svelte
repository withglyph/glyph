<script lang="ts">
  import clsx from 'clsx';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import Display from './Display.svelte';
  import Editor from './Editor.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let getPos: NodeViewProps['getPos'];
  export let deleteNode: NodeViewProps['deleteNode'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let open = node.attrs.layout === 'initial';
  let onClose: (() => void) | null;

  const handleClose = () => {
    if (node.attrs.layout !== 'initial' && node.attrs.__data.length === 0) {
      deleteNode();
      return;
    }

    if (editor && node.attrs.layout === 'standalone' && node.attrs.__data.length > 0) {
      let chain = editor.chain();
      for (const image of node.attrs.__data) {
        chain = chain.setStandaloneGallery(image);
      }
      chain.run();
      deleteNode();
      return;
    }
  };

  $: if (open) {
    onClose = handleClose;
  } else {
    onClose?.();
    onClose = null;
  }
</script>

<NodeView class="flex center pointer-events-none py-4px" data-drag-handle draggable>
  <div
    class={clsx(
      'pointer-events-auto max-w-960px',
      node.attrs.ids.length === 0 && 'bg-#d9d9d9 w-400px h-200px',
      selected && 'ring-2 ring-teal-500',
    )}
  >
    <Display {node} {updateAttributes} />
  </div>
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

  <Editor {node} {updateAttributes} bind:open />
{/if}
