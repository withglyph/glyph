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
  <div
    class="fixed inset-0 m-4 z-999 flex center"
    role="presentation"
    on:click={() => (open = false)}
    use:portal
    use:scrollLock
  >
    <div class="fixed inset-0 bg-black/50" />
    <Image class="max-w-full max-h-full overflow-scroll" $image={image} />
  </div>
{/if}
