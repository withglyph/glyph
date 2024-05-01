<script lang="ts">
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
  export let getPos: NodeViewProps['getPos'];

  $: query = graphql(`
    query TiptapFileNodeView_Query($id: ID!) @_manual {
      file(id: $id) {
        id
        name
        size
        url
      }
    }
  `);

  onMount(() => {
    query.refetch({ id: node.attrs.id });
  });
</script>

<NodeView style={center.raw({ paddingY: '4px' })} data-drag-handle draggable>
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
        outlineColor: 'brand.400',
      },
    )}
    href={editor?.isEditable ? undefined : $query?.file.url}
  >
    <div class={flex({ align: 'center', gap: '8px', grow: '1' })}>
      <div class={flex({ align: 'center', gap: '6px' })}>
        <Icon style={css.raw({ color: 'gray.300' })} icon={IconFolder} size={20} />
        <div class={css({ fontSize: '14px', lineClamp: 1 })}>
          {$query?.file.name ?? '정보 가져오는 중...'}
        </div>
      </div>

      {#if $query}
        <div class={css({ width: '1px', height: '12px', backgroundColor: 'gray.300' })} />

        <div class={css({ flex: 'none', fontSize: '14px', color: 'gray.400' })}>
          {numeral($query.file.size).format('0b')}
        </div>
      {/if}
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
        <Icon style={css.raw({ color: 'gray.600' })} icon={IconGripVertical} size={20} />
      {:else}
        <Icon style={css.raw({ color: 'gray.600' })} icon={IconDownload} size={20} />
      {/if}
    </div>

    {#if !$query}
      <div class={center({ position: 'absolute', inset: '0', backgroundColor: 'gray.5/50' })}>
        <RingSpinner style={css.raw({ size: '32px', color: 'brand.400' })} />
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
      <Icon style={css.raw({ color: 'gray.600' })} icon={IconTrash} size={20} />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
