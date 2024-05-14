<script lang="ts">
  import IconEmbedCompact from '~icons/glyph/embed-compact';
  import IconEmbedFull from '~icons/glyph/embed-full';
  import IconAlignCenter from '~icons/tabler/align-center';
  import IconAlignLeft from '~icons/tabler/align-left';
  import IconAlignRight from '~icons/tabler/align-right';
  import IconEdit from '~icons/tabler/edit';
  import IconTrash from '~icons/tabler/trash';
  import { Icon } from '$lib/components';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Image from './Image.svelte';
  import ImageViewer from './ImageViewer.svelte';
  import ItemEditor from './ItemEditor.svelte';
  import Slide from './Slide.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let getPos: NodeViewProps['getPos'];
  export let deleteNode: NodeViewProps['deleteNode'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let openItemEditor = false;
  let viewerOpen = false;
</script>

<NodeView
  style={css.raw(
    { display: 'flex', alignItems: 'center', pointerEvents: 'none', paddingY: '4px', smDown: { marginX: '-20px' } },
    node.attrs.align === 'left' && { justifyContent: 'flex-start' },
    node.attrs.align === 'center' && { justifyContent: 'center' },
    node.attrs.align === 'right' && { justifyContent: 'flex-end' },
  )}
  data-drag-handle
  draggable
>
  <div
    class={css(
      { minWidth: '0', pointerEvents: 'auto', width: 'full' },
      node.attrs.size === 'full' && { maxWidth: 'full' },
      node.attrs.size === 'compact' && { maxWidth: '500px' },
      selected && { ringWidth: '2px', ringColor: 'brand.400' },
    )}
    role="button"
    tabindex="-1"
    on:click={() => {
      if (!editor?.isEditable) {
        viewerOpen = true;
      }
    }}
    on:keypress={null}
  >
    {#if node.attrs.layout === 'slide-1' || node.attrs.layout === 'slide-2'}
      <Slide ids={node.attrs.ids} pages={node.attrs.layout === 'slide-2' ? 2 : 1} size={node.attrs.size} />
    {:else}
      <div
        class={css(
          node.attrs.layout === 'scroll' && { display: 'flex', flexDirection: 'column', alignItems: 'center' },
          node.attrs.layout === 'grid-2' && { display: 'grid', gridTemplateColumns: '2' },
          node.attrs.layout === 'grid-3' && { display: 'grid', gridTemplateColumns: '3' },
          { smDown: { maxWidth: 'full' } },
        )}
      >
        {#each node.attrs.ids as id (id)}
          <Image {id} style={css.raw({ size: 'full', objectFit: 'cover' })} />
        {/each}
      </div>
    {/if}
  </div>

  <ImageViewer {node} bind:open={viewerOpen} />
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button
      class={flex({
        align: 'center',
        gap: '2px',
        padding: '2px',
        paddingRight: '4px',
        fontSize: '12px',
        fontWeight: 'medium',
        color: 'gray.500',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={() => (openItemEditor = true)}
    >
      <Icon style={css.raw({ size: '18px' })} icon={IconEdit} />
      그룹편집
    </button>

    <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />

    <button
      class={css({
        padding: '2px',
        color: 'gray.500',
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
        padding: '2px',
        color: 'gray.500',
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
          padding: '2px',
          color: 'gray.500',
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
          padding: '2px',
          color: 'gray.500',
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
          padding: '2px',
          color: 'gray.500',
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
        padding: '2px',
        color: 'gray.500',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={() => deleteNode()}
    >
      <Icon style={css.raw({ color: 'gray.600', size: '18px' })} icon={IconTrash} />
    </button>
  </TiptapNodeViewBubbleMenu>

  <ItemEditor {node} {updateAttributes} bind:open={openItemEditor} />
{/if}
