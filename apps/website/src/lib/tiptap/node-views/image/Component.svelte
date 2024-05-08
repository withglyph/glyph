<script lang="ts">
  import { onMount } from 'svelte';
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

<NodeView style={center.raw({ paddingY: '4px', smDown: { marginX: '-20px' } })} data-drag-handle draggable>
  <div class={css({ maxWidth: 'full' }, selected && { ringWidth: '2px', ringColor: 'brand.400' })}>
    {#if $query}
      <Image style={css.raw({ maxWidth: 'full' })} $image={$query.image} size="full" />
    {:else}
      <div class={center({ size: '400px', backgroundColor: 'gray.50' })}>
        <RingSpinner style={css.raw({ size: '32px', color: 'brand.400' })} />
      </div>
    {/if}
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
      on:click={() => deleteNode()}
    >
      <Icon style={css.raw({ color: 'gray.600' })} icon={IconTrash} size={20} />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
