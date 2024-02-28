<script lang="ts">
  import ky from 'ky';
  import { onMount } from 'svelte';
  import IconTrash from '~icons/tabler/trash';
  import { graphql } from '$glitch';
  import { Icon, Image } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
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

<NodeView style={center.raw({ paddingY: '4px' })} data-drag-handle draggable>
  {#if editor?.isEditable}
    <div
      class={css(
        { position: 'relative', maxWidth: 'full', pointerEvents: 'auto' },
        selected && { ringWidth: '2px', ringColor: 'teal.500' },
      )}
    >
      {#if node.attrs.__file}
        <FileImage style={css.raw({ width: 'full' })} file={node.attrs.__file} />
        <div class={center({ position: 'absolute', inset: '0', backgroundColor: '[white/50]' })}>
          <RingSpinner style={css.raw({ size: '32px', color: '[#FCD242]' })} />
        </div>
      {:else if node.attrs.__data}
        <Image style={css.raw({ maxWidth: 'full' })} $image={node.attrs.__data} />
      {/if}
    </div>
  {:else if node.attrs.__data}
    <div class={css({ display: 'contents', pointerEvents: 'auto' })} role="presentation" on:click={() => (open = true)}>
      <Image style={css.raw({ maxWidth: 'full' })} $image={node.attrs.__data} />
    </div>

    {#if open}
      <div
        class={center({ position: 'fixed', zIndex: '[999]', inset: '0', margin: '16px' })}
        role="presentation"
        on:click={() => (open = false)}
        use:portal
        use:scrollLock
      >
        <div class={css({ position: 'fixed', inset: '0', backgroundColor: '[black.50]' })} />
        <Image
          style={css.raw({ maxWidth: 'full', maxHeight: 'full', overflow: 'scroll' })}
          $image={node.attrs.__data}
        />
      </div>
    {/if}
  {/if}
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
      <Icon style={css.raw({ color: 'gray.600', size: '18px' })} icon={IconTrash} />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
