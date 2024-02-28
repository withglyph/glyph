<script lang="ts">
  import IconTrash from '~icons/tabler/trash';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import IsomorphicImage from './IsomorphicImage.svelte';
  import Slide from './Slide.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  export let deletable = false;

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
  )}
>
  {#if node.attrs.layout === 'slide'}
    <Slide isomorphicImages={node.attrs.__data} slidesPerPage={node.attrs.slidesPerPage} spacing={node.attrs.spacing} />
  {:else}
    {#each node.attrs.__data as image (image.id)}
      <div class={css({ position: 'relative', size: 'full' })}>
        <IsomorphicImage style={css.raw({ size: 'full', objectFit: 'cover' })} {image} />
        {#if deletable}
          <button
            class={center({
              position: 'absolute',
              right: '14px',
              bottom: '14px',
              borderRadius: '2px',
              backgroundColor: '[#09090B66]',
              size: '26px',
            })}
            type="button"
            on:click={() => removeImage(image.id)}
          >
            <Icon style={css.raw({ color: 'white', size: '18px' })} icon={IconTrash} />
          </button>
        {/if}
      </div>
    {/each}
  {/if}
</div>
