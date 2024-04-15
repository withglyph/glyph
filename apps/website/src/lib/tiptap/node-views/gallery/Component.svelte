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

<NodeView
  style={css.raw(
    {
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
      paddingY: '4px',
    },
    node.attrs.align === 'left' && { justifyContent: 'flex-start' },
    node.attrs.align === 'center' && { justifyContent: 'center' },
    node.attrs.align === 'right' && { justifyContent: 'flex-end' },
  )}
  data-drag-handle
  draggable
>
  <div
    class={css(
      {
        minWidth: '0',
        pointerEvents: 'auto',
      },
      node.attrs.ids.length === 0 && { backgroundColor: '[#D9D9D9]', width: '400px', height: '200px' },
      selected && { ringWidth: '2px', ringColor: 'teal.500' },
    )}
  >
    <div class={css(editor?.isEditable && { pointerEvents: 'none' })}>
      <Display {node} {updateAttributes} />
    </div>
  </div>
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
      on:click={() => (open = true)}
    >
      <Icon style={css.raw({ color: 'gray.600' })} icon={IconEdit} size={20} />
    </button>

    <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />

    {#if node.attrs.size === 'compact'}
      <button
        class={css({
          borderRadius: '2px',
          padding: '4px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
        })}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'left' });
          editor?.commands.focus();
        }}
      >
        <Icon
          style={css.raw(
            {
              color: 'gray.600',
            },
            node.attrs.align === 'left' && { color: 'teal.500' },
          )}
          icon={IconAlignLeft}
          size={20}
        />
      </button>

      <button
        class={css({
          borderRadius: '2px',
          padding: '4px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
        })}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'center' });
          editor?.commands.focus();
        }}
      >
        <Icon
          style={css.raw(
            {
              color: 'gray.600',
            },
            node.attrs.align === 'center' && { color: 'teal.500' },
          )}
          icon={IconAlignCenter}
          size={20}
        />
      </button>

      <button
        class={css({
          borderRadius: '2px',
          padding: '4px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
        })}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'right' });
          editor?.commands.focus();
        }}
      >
        <Icon
          style={css.raw(
            {
              color: 'gray.600',
            },
            node.attrs.align === 'right' && { color: 'teal.500' },
          )}
          icon={IconAlignRight}
          size={20}
        />
      </button>

      <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />
    {/if}

    <button
      class={css({
        borderRadius: '2px',
        padding: '4px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={() => {
        updateAttributes({ size: 'full' });
        editor?.commands.focus();
      }}
    >
      <Icon
        style={css.raw(
          {
            color: 'gray.600',
          },
          node.attrs.size === 'full' && { color: 'teal.500' },
        )}
        icon={IconEmbedFull}
        size={20}
      />
    </button>
    <button
      class={css({
        borderRadius: '2px',
        padding: '4px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={() => {
        updateAttributes({ size: 'compact' });
        editor?.commands.focus();
      }}
    >
      <Icon
        style={css.raw(
          {
            color: 'gray.600',
          },
          node.attrs.size === 'compact' && { color: 'teal.500' },
        )}
        icon={IconEmbedCompact}
        size={20}
      />
    </button>

    <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />

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
      <Icon style={css.raw({ color: 'gray.600' })} icon={IconTrash} size={20} />
    </button>
  </TiptapNodeViewBubbleMenu>

  <Editor {node} {updateAttributes} bind:open />
{/if}
