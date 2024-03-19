<script lang="ts">
  import ky from 'ky';
  import numeral from 'numeral';
  import { onMount } from 'svelte';
  import IconDownload from '~icons/tabler/download';
  import IconFolder from '~icons/tabler/folder';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconTrash from '~icons/tabler/trash';
  import { graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
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

<NodeView style={center.raw({ paddingY: '4px' })} data-drag-handle draggable>
  {@const data = node.attrs.__file ?? node.attrs.__data}

  <svelte:element
    this={editor?.isEditable ? 'div' : 'a'}
    class={css(
      {
        position: 'relative',
        display: 'flex',
        borderWidth: '1px',
        borderColor: 'gray.300',
        borderRadius: '4px',
        padding: '12px',
        width: '400px',
        pointerEvents: 'auto',
      },
      selected && {
        outlineWidth: '2px',
        outlineColor: 'teal.500',
      },
    )}
    href={editor?.isEditable ? undefined : data.url}
  >
    <div class={flex({ align: 'center', gap: '8px', grow: '1' })}>
      <div class={flex({ align: 'center', gap: '6px' })}>
        <Icon style={css.raw({ size: '18px', color: 'gray.300' })} icon={IconFolder} />
        <div class={css({ fontSize: '14px', lineClamp: 1 })}>{data.name}</div>
      </div>

      <div class={css({ width: '1px', height: '12px', backgroundColor: 'gray.300' })} />

      <div class={css({ flex: 'none', fontSize: '14px', color: 'gray.400' })}>{numeral(data.size).format('0b')}</div>
    </div>

    <div
      class={css({
        borderRadius: '4px',
        padding: '4px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
    >
      {#if editor?.isEditable}
        <Icon style={css.raw({ size: '18px', color: 'gray.600' })} icon={IconGripVertical} />
      {:else}
        <Icon style={css.raw({ size: '18px', color: 'gray.600' })} icon={IconDownload} />
      {/if}
    </div>

    {#if !node.attrs.id}
      <div class={center({ position: 'absolute', inset: '0', backgroundColor: 'gray.5/50' })}>
        <RingSpinner style={css.raw({ size: '32px', color: 'teal.500' })} />
      </div>
    {/if}
  </svelte:element>
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button
      class={css({
        borderRadius: '2px',
        padding: '4px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={() => deleteNode()}
    >
      <Icon style={css.raw({ size: '18px', color: 'gray.600' })} icon={IconTrash} />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
