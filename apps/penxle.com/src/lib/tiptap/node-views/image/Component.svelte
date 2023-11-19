<script lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import clsx from 'clsx';
  import ky from 'ky';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { NodeView } from '$lib/tiptap';
  import FileImage from './FileImage.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'] | undefined;
  // export let deleteNode: NodeViewProps['deleteNode'] | undefined;
  export let updateAttributes: NodeViewProps['updateAttributes'] | undefined;

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

    updateAttributes?.({
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

<NodeView class="flex center p-4">
  {#if editor?.isEditable}
    <div class={clsx('relative max-w-full', selected && 'ring-4 ring-brand-50')} data-drag-handle>
      {#if node.attrs.__file}
        <FileImage class="w-full" file={node.attrs.__file} />
        <div class="absolute inset-0 flex center bg-white/50">
          <RingSpinner class="w-8 h-8 text-brand-50" />
        </div>
      {:else if node.attrs.__data}
        <Image class="max-w-full" $image={node.attrs.__data} draggable intrinsic />
      {/if}
    </div>
  {:else}
    <Image class="max-w-full" $image={node.attrs.__data} intrinsic />
  {/if}
</NodeView>
