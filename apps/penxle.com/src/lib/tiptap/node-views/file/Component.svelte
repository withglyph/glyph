<script lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import clsx from 'clsx';
  import ky from 'ky';
  import numeral from 'numeral';
  import { onMount } from 'svelte';
  import IconDownload from '~icons/tabler/download';
  import IconFolder from '~icons/tabler/folder';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconTrash from '~icons/tabler/trash';
  import { graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let deleteNode: NodeViewProps['deleteNode'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let getPos: NodeViewProps['getPos'];

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
  {@const data = node.attrs.__file ?? node.attrs.__data}

  <svelte:element
    this={editor?.isEditable ? 'div' : 'a'}
    class={clsx(
      'relative w-400px p-12px border border-gray-300 rounded-4px flex pointer-events-auto',
      selected && 'ring-2 ring-teal-500',
    )}
    href={editor?.isEditable ? undefined : data.url}
  >
    <div class="flex gap-8px items-center grow">
      <div class="flex gap-6px items-center">
        <Icon class="text-gray-300 square-18px" icon={IconFolder} />
        <div class="text-14-r line-clamp-1">{data.name}</div>
      </div>
      <div class="w-1px h-12px bg-gray-300" />
      <div class="text-14-r text-gray-400 flex-none">{numeral(data.size).format('0b')}</div>
    </div>

    <div class="p-4px rounded-4px transition hover:bg-gray-100">
      {#if editor?.isEditable}
        <Icon class="block text-gray-600 square-18px" icon={IconGripVertical} />
      {:else}
        <Icon class="block text-gray-600 square-18px" icon={IconDownload} />
      {/if}
    </div>

    {#if !node.attrs.id}
      <div class="absolute inset-0 flex center bg-white/50">
        <RingSpinner class="w-8 h-8 text-teal-500" />
      </div>
    {/if}
  </svelte:element>
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button class="p-4px rounded-2px transition hover:bg-gray-100" type="button" on:click={() => deleteNode()}>
      <Icon class="block text-gray-600 square-18px" icon={IconTrash} />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
