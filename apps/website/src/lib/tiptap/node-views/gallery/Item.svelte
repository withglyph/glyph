<script lang="ts">
  import { onMount } from 'svelte';
  // import IconArrowsExchange from '~icons/tabler/arrows-exchange';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconTrash from '~icons/tabler/trash';
  import { graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { css, cx } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Image from './Image.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  $: query = graphql(`
    query TiptapGalleryNodeViewItem_Image_Query($id: ID!) @_manual {
      image(id: $id) {
        id
        name
        ...Image_image
      }
    }
  `);

  onMount(() => {
    query.refetch({ id });
  });

  export let index: number;
  export let id: string;
  export let updateAttributes: NodeViewProps['updateAttributes'];

  const removeImage = () => {
    updateAttributes((attrs) => ({ ids: attrs.ids.filter((i: string) => i !== id) }));
  };
</script>

<li
  class={cx(
    'image',
    flex({
      position: 'relative',
      align: 'center',
      borderWidth: '1px',
      borderColor: 'gray.100',
      paddingX: '14px',
      paddingY: '8px',
      backgroundColor: { base: 'gray.5', _hover: 'gray.100' },
      height: '64px',
      width: 'full',
      cursor: 'grab',
    }),
  )}
  data-id={id}
>
  <span
    class={css({
      flex: 'none',
      marginRight: '12px',
      fontSize: '12px',
      fontWeight: 'medium',
      color: 'gray.500',
      textAlign: 'center',
      width: '26px',
    })}
  >
    {index + 1}
  </span>
  <Image {id} style={css.raw({ marginRight: '8px', size: '48px', objectFit: 'cover' })} />
  <p class={css({ flexGrow: '1', fontSize: '13px', textAlign: 'left', truncate: true })}>
    {$query?.image.name ?? ''}
  </p>

  <div class={flex({ align: 'center', gap: '8px', marginLeft: '20px' })}>
    <!-- <button class={css({ padding: '4px' })} type="button">
      <Icon style={css.raw({ color: 'gray.800' })} icon={IconArrowsExchange} size={20} />
    </button> -->
    <button type="button" on:click={removeImage}>
      <Icon style={css.raw({ color: 'gray.800' })} icon={IconTrash} size={20} />
    </button>
    <div class={css({ padding: '4px' })}>
      <Icon style={css.raw({ color: 'gray.800' })} icon={IconGripVertical} size={20} />
    </div>
  </div>
</li>

<style>
  .dragging-item {
    border-width: 2px;
    /* brand.400 */
    border-color: #8162e8;
    /* brand.50 */
    background-color: #f9f7ff;
  }
</style>
