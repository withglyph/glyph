<script lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import clsx from 'clsx';
  import ky from 'ky';
  import numeral from 'numeral';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { NodeView } from '$lib/tiptap';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'] | undefined;
  // export let deleteNode: NodeViewProps['deleteNode'] | undefined;
  export let updateAttributes: NodeViewProps['updateAttributes'] | undefined;

  const prepareFileUpload = graphql(`
    mutation TiptapFile_PrepareFileUpload_Mutation {
      prepareFileUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeFileUpload = graphql(`
    mutation TiptapFile_FinalizeFileUpload_Mutation($input: FinalizeFileUploadInput!) {
      finalizeFileUpload(input: $input) {
        id
        name
        size
        url
      }
    }
  `);

  const upload = async () => {
    const file = node.attrs.__file as File;

    const { key, presignedUrl } = await prepareFileUpload();
    await ky.put(presignedUrl, { body: file });
    const resp = await finalizeFileUpload({ key, name: file.name });

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

<NodeView
  class={clsx(
    'flex gap-2 items-center m-4 px-8 py-4 border relative w-full',
    editor?.isEditable && selected && 'ring-4 ring-brand-50',
  )}
  as={editor?.isEditable ? undefined : 'a'}
  href={editor?.isEditable ? undefined : node.attrs.__data.url}
>
  {@const data = node.attrs.__file ?? node.attrs.__data}

  <span class="i-lc-file" />
  <div class="font-bold">{data.name}</div>
  <div class="text-sm text-gray-50">{numeral(data.size).format('0b')}</div>

  {#if !node.attrs.id}
    <div class="absolute inset-0 flex center bg-white/50">
      <RingSpinner class="w-8 h-8 text-brand-50" />
    </div>
  {/if}
</NodeView>
