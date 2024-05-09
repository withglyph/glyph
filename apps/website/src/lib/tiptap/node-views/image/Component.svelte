<script lang="ts">
  import { onMount } from 'svelte';
  import IconEmbedCompact from '~icons/glyph/embed-compact';
  import IconEmbedFull from '~icons/glyph/embed-full';
  import IconAlignCenter from '~icons/tabler/align-center';
  import IconAlignLeft from '~icons/tabler/align-left';
  import IconAlignRight from '~icons/tabler/align-right';
  import IconTrash from '~icons/tabler/trash';
  import { graphql } from '$glitch';
  import { Icon, Image } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let deleteNode: NodeViewProps['deleteNode'];

  $: query = graphql(`
    query TiptapImageNodeView_Query($id: ID!) @_manual {
      image(id: $id) {
        id
        ...Image_image
      }
    }
  `);

  onMount(() => {
    query.refetch({ id: node.attrs.id });
  });
</script>

<NodeView
  style={css.raw(
    { display: 'flex', alignItems: 'center', paddingY: '4px', pointerEvents: 'none', smDown: { marginX: '-20px' } },
    node.attrs.align === 'left' && { justifyContent: 'flex-start' },
    node.attrs.align === 'center' && { justifyContent: 'center' },
    node.attrs.align === 'right' && { justifyContent: 'flex-end' },
  )}
  data-drag-handle
  draggable
>
  <div
    class={css(
      { minWidth: '0', pointerEvents: 'auto' },
      node.attrs.size === 'full' && { maxWidth: 'full' },
      node.attrs.size === 'compact' && { maxWidth: '500px' },
      selected && { ringWidth: '2px', ringColor: 'brand.400' },
    )}
  >
    {#if $query}
      <Image style={css.raw({ maxWidth: 'full' })} $image={$query.image} size="full" />
    {:else}
      <div
        class={center({
          size: '200px',
          backgroundColor: 'gray.50',
        })}
      >
        <RingSpinner style={css.raw({ size: '32px', color: 'brand.400' })} />
      </div>
    {/if}
  </div>
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button
      class={css({
        margin: '2px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
        _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
      })}
      aria-pressed={node.attrs.size === 'full'}
      type="button"
      on:click={() => {
        updateAttributes({ size: 'full' });
        editor?.commands.focus();
      }}
    >
      <Icon style={css.raw({ size: '18px' })} icon={IconEmbedFull} />
    </button>
    <button
      class={css({
        margin: '2px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
        _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
      })}
      aria-pressed={node.attrs.size === 'compact'}
      type="button"
      on:click={() => {
        updateAttributes({ size: 'compact' });
        editor?.commands.focus();
      }}
    >
      <Icon style={css.raw({ size: '18px' })} icon={IconEmbedCompact} />
    </button>

    <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />

    {#if node.attrs.size === 'compact'}
      <button
        class={css({
          margin: '2px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
          _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
        })}
        aria-pressed={node.attrs.align === 'left'}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'left' });
          editor?.commands.focus();
        }}
      >
        <Icon style={css.raw({ size: '18px' })} icon={IconAlignLeft} />
      </button>

      <button
        class={css({
          margin: '2px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
          _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
        })}
        aria-pressed={node.attrs.align === 'center'}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'center' });
          editor?.commands.focus();
        }}
      >
        <Icon style={css.raw({ size: '18px' })} icon={IconAlignCenter} />
      </button>

      <button
        class={css({
          margin: '2px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
          _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
        })}
        aria-pressed={node.attrs.align === 'right'}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'right' });
          editor?.commands.focus();
        }}
      >
        <Icon style={css.raw({ size: '18px' })} icon={IconAlignRight} />
      </button>

      <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />
    {/if}

    <button
      class={css({
        margin: '2px',
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
