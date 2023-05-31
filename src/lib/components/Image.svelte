<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import clsx from 'clsx';
  import { PUBLIC_CDN_URL } from '$env/static/public';
  import { fragment, graphql } from '$houdini';
  import { intersectionObserver } from '$lib/svelte/actions';
  import type { Image_image } from '$houdini';

  let _image: Image_image;
  let _class: string | undefined = undefined;
  export let fit: 'contain' | 'cover' = 'cover';
  export let eagerLoad = false;
  export { _image as $image };
  export { _class as class };

  let src: string;

  let visible = writable(false);
  let loaded = false;
  let fullyLoaded = false;

  let offsetWidth: number;
  let offsetHeight: number;

  $: image = fragment(
    _image,
    graphql(`
      fragment Image_image on Image {
        path
        sizes

        width
        height

        placeholder
      }
    `)
  );

  $: sizes = [...$image.sizes, Number.POSITIVE_INFINITY].sort((a, b) => a - b);

  $: {
    const targetSize =
      window.devicePixelRatio * Math.max(offsetWidth, offsetHeight);
    for (const size of sizes) {
      if (size > targetSize) {
        src = `${PUBLIC_CDN_URL}/${$image.path}/${
          size === Number.POSITIVE_INFINITY ? 'full' : size
        }`;
        break;
      }
    }
  }
</script>

<div class={clsx('flex center overflow-hidden', _class)}>
  <div
    style:aspect-ratio={$image.width / $image.height}
    class={clsx(
      'relative overflow-hidden',
      !fullyLoaded && 'blur-0',
      $image.width > $image.height === (fit === 'cover') ? 'h-full' : 'w-full'
    )}
    bind:offsetWidth
    bind:offsetHeight
    use:intersectionObserver={{
      store: visible,
      once: true,
    }}
  >
    {#if eagerLoad || $visible}
      <img
        class="square-full object-cover"
        {src}
        on:load={() => (loaded = true)}
      />
    {/if}

    {#if !fullyLoaded}
      <div
        class="absolute inset-0 square-full children:(transition duration-200 ease-in-out)"
        on:transitionend={() => (fullyLoaded = true)}
      >
        <img
          class={clsx(
            'square-full object-cover',
            loaded ? 'opacity-0 scale-100' : 'opacity-100 scale-125'
          )}
          src={$image.placeholder}
        />

        <div
          class={clsx(
            'absolute inset-0 square-full backdrop-blur-xl',
            loaded ? 'opacity-0' : 'opacity-100'
          )}
        />
      </div>
    {/if}
  </div>
</div>
