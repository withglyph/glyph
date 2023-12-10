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
    <Image
      class={clsx(
        'grid',
        images.length === 1 && 'rounded-lg',
        images.length === 2 && 'first-of-type:rounded-l-lg last-of-type:rounded-r-lg',
        images.length === 3 &&
          'first-of-type:rounded-lt-lg even:rounded-rt-lg last-of-type:(col-span-full rounded-b-lg)',
        images.length === 4 &&
          'first-of-type:(rounded-lt-lg rounded-lb-none) even:rounded-rt-lg odd:rounded-lb-lg last-of-type:(rounded-rb-lg rounded-rt-none)',
      )}
      $image={image}
    />
  {/each}
</div>
