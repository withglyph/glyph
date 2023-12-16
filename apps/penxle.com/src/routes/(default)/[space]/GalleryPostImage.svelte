<script lang="ts">
  import clsx from 'clsx';
  import { Image } from '$lib/components';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import type { Image_image } from '$glitch';

  export let image: Image_image;
  export let mode: string | null;

  let open = false;
</script>

<div class="contents" role="presentation" on:click={() => (open = true)}>
  <Image
    class={clsx(
      'square-[calc(100vw-32px)] max-w-187.5 max-h-187.5 bg-black rounded-xl select-none',
      mode === 'mobile' && 'max-w-368px! max-h-368px!',
    )}
    $image={image}
    fit="contain"
  />
</div>

{#if open}
  <div class="fixed inset-0 mx-4 z-999" role="presentation" on:click={() => (open = false)} use:portal>
    <div class="fixed inset-0 bg-black/50" />
    <div class="flex center w-full h-full overflow-scroll" use:scrollLock>
      <Image class="w-full" $image={image} />
    </div>
  </div>
{/if}
