<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import clsx from 'clsx';
  import { PUBLIC_CDN_URL } from '$env/static/public';
  import { fragment, graphql } from '$houdini';
  import { intersectionObserver } from '$lib/svelte/actions';
  import type { Image_image } from '$houdini';

  let _image: Image_image;
  export { _image as $image };
  let _class: string | undefined = undefined;
  export { _class as class };
  export let fit: 'contain' | 'cover' = 'cover';
  export let eagerLoad = false;

  let src: string | undefined = undefined;

  let visible = writable(false);
  let loaded = false;
  let fullyLoaded = false;

  let outerWidth: number | undefined = undefined;
  let outerHeight: number | undefined = undefined;

  let innerWidth = 0;
  let innerHeight = 0;

  let actualWidth: number | undefined = undefined;
  let actualHeight: number | undefined = undefined;

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

  $: ({ width, height } = $image);
  $: sizes = [...$image.sizes, Number.POSITIVE_INFINITY].sort((a, b) => a - b);
  $: ratio = width / height;

  $: if (outerWidth && outerHeight) {
    if (width > height === (fit === 'contain')) {
      innerWidth = outerWidth;
      innerHeight = outerWidth / ratio;
    } else {
      innerWidth = outerHeight * ratio;
      innerHeight = outerHeight;
    }
  } else if (outerWidth && outerHeight === 0) {
    innerWidth = outerWidth;
    innerHeight = outerWidth / ratio;
  } else if (outerWidth === 0 && outerHeight) {
    innerWidth = outerHeight * ratio;
    innerHeight = outerHeight;
  } else if (outerWidth === 0 && outerHeight === 0) {
    innerWidth = 0;
    innerHeight = 0;
  }

  $: if (actualWidth && actualHeight) {
    const targetSize =
      window.devicePixelRatio * Math.max(actualWidth, actualWidth);
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

<div
  class={clsx('flex center overflow-hidden', _class)}
  bind:clientWidth={outerWidth}
  bind:clientHeight={outerHeight}
>
  <div
    style:width={`${innerWidth}px`}
    style:height={`${innerHeight}px`}
    class={clsx('relative overflow-hidden', !fullyLoaded && 'blur-0')}
    bind:clientWidth={actualWidth}
    bind:clientHeight={actualHeight}
    use:intersectionObserver={{
      store: visible,
      once: true,
    }}
  >
    {#if src && (eagerLoad || $visible)}
      <img
        class="square-full object-cover"
        {src}
        on:load={() => (loaded = true)}
      />
    {/if}

    {#if !fullyLoaded}
      <div
        class="absolute inset-0 square-full children:(transition duration-150 ease-out)"
        on:transitionend={() => (fullyLoaded = true)}
      >
        <img
          class={clsx(
            'square-full object-cover',
            loaded ? 'opacity-0' : 'opacity-100'
          )}
          src={$image.placeholder}
        />

        <div
          class={clsx(
            'absolute inset-0 square-full',
            loaded ? 'backdrop-blur-none' : 'backdrop-blur-xl'
          )}
        />
      </div>
    {/if}
  </div>
</div>
