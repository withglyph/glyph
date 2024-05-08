<script lang="ts">
  import { getContext } from 'svelte';
  import IconArrowsExchange from '~icons/tabler/arrows-exchange';
  import IconTrash from '~icons/tabler/trash';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import IsomorphicImage from './IsomorphicImage.svelte';
  import Slide from './Slide.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  export let editable = false;

  let exchangeImage = getContext<(id: string) => void>('exchangeImage');

  const removeImage = async (id: string) => {
    await updateAttributes((attrs) => ({
      __data: attrs.__data.filter((i: IsomorphicImage) => i.id !== id),
    }));
  };
</script>

<div
  class={css(
    node.attrs.size === 'full' && { maxWidth: 'full' },
    node.attrs.size === 'compact' && { maxWidth: '500px' },
    node.attrs.layout === 'standalone' && { gap: '24px' },
    node.attrs.layout !== 'grid' && { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    node.attrs.layout === 'grid' && { display: 'grid' },
    node.attrs.layout === 'grid' && node.attrs.gridColumns === 2 && { gridTemplateColumns: '2' },
    node.attrs.layout === 'grid' && node.attrs.gridColumns === 3 && { gridTemplateColumns: '3' },
    node.attrs.spacing && { gap: '6px' },
    { smDown: { maxWidth: 'full' } },
  )}
>
  {#if node.attrs.layout === 'slide'}
    <Slide isomorphicImages={node.attrs.__data} slidesPerPage={node.attrs.slidesPerPage} spacing={node.attrs.spacing} />
  {:else}
    {#each node.attrs.__data as image (image.id)}
      <div class={css({ position: 'relative', size: 'full' })}>
        <IsomorphicImage style={css.raw({ size: 'full', objectFit: 'cover' })} {image} />
        {#if editable}
          <div class={css({ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px' })}>
            <button
              class={center({
                backgroundColor: 'gray.800/40',
                size: '24px',
              })}
              type="button"
              on:click={() => exchangeImage(image.id)}
            >
              <Icon style={css.raw({ color: 'gray.50' })} icon={IconArrowsExchange} size={20} />
            </button>

            <button
              class={center({
                backgroundColor: 'gray.800/40',
                size: '24px',
              })}
              type="button"
              on:click={() => removeImage(image.id)}
            >
              <Icon style={css.raw({ color: 'gray.50' })} icon={IconTrash} size={20} />
            </button>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
