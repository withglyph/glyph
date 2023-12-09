<script lang="ts">
  import clsx from 'clsx';
  import { Image } from '$lib/components';
  import type { Image_image } from '$glitch';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let images: Image_image[];
</script>

<div
  class={clsx(
    'grid',
    images.length === 1 && 'grid-cols-1',
    images.length === 2 && 'grid-cols-2',
    images.length >= 3 && 'grid-rows-2 grid-cols-2',
    _class,
  )}
>
  {#each images.slice(0, 4) as image, idx (idx)}
    <Image class={clsx('grid', images.length === 3 && 'last-of-type:col-span-full')} $image={image} />
  {/each}
</div>
