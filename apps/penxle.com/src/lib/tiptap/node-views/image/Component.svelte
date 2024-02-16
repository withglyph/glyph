<script lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import clsx from 'clsx';
  import ky from 'ky';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import FileImage from './FileImage.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let getPos: NodeViewProps['getPos'];
  export let deleteNode: NodeViewProps['deleteNode'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let open = false;

  const prepareImageUpload = graphql(`
    mutation TiptapImage_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation TiptapImage_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
        ...Image_image
      }
    }
  `);

  const upload = async () => {
    const file = node.attrs.__file as File;

    const { key, presignedUrl } = await prepareImageUpload();
    await ky.put(presignedUrl, { body: file });
    const resp = await finalizeImageUpload({ key, name: file.name });

    updateAttributes({
      id: resp.id,
      __data: resp,
      __file: undefined,
    });
  };

  onMount(() => {
    if (node.attrs.__file) {
      upload();
    }
  });
</script>

<NodeView class="flex center py-4px" data-drag-handle draggable>
  {#if editor?.isEditable}
    <div class={clsx('relative max-w-full pointer-events-auto', selected && 'ring-2px ring-teal-500')}>
      {#if node.attrs.__file}
        <FileImage class="w-full" file={node.attrs.__file} />
        <div class="absolute inset-0 flex center bg-white/50">
          <RingSpinner class="w-8 h-8 text-brand-50" />
        </div>
      {:else if node.attrs.__data}
        <Image class="max-w-full" $image={node.attrs.__data} />
      {/if}
    </div>
  {:else if node.attrs.__data}
    <div class="contents pointer-events-auto" role="presentation" on:click={() => (open = true)}>
      <Image class="max-w-full" $image={node.attrs.__data} />
    </div>

    {#if open}
      <div
        class="fixed inset-0 m-4 z-999 flex center"
        role="presentation"
        on:click={() => (open = false)}
        use:portal
        use:scrollLock
      >
        <div class="fixed inset-0 bg-black/50" />
        <Image class="max-w-full max-h-full overflow-scroll" $image={node.attrs.__data} />
      </div>
    {/if}
  {/if}
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button class="p-4px rounded-2px transition hover:bg-gray-100" type="button" on:click={() => deleteNode()}>
      <i class="i-tb-trash text-gray-600 square-18px block" />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
