<script lang="ts">
  import clsx from 'clsx';
  import { PUBLIC_CDN_URL } from '$env/static/public';
  import { fragment, graphql } from '$houdini';
  import type { Image_image } from '$houdini';

  let _image: Image_image;
  let _class: string | undefined = undefined;
  export let size: number | undefined = undefined;
  export let fit: 'contain' | 'cover' = 'cover';
  export { _image as $image };
  export { _class as class };

  let src: string;
  let srcset: string | undefined = undefined;

  let loaded = false;
  let fullyLoaded = false;

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

  $: src = url(size);
  $: srcset = size
    ? `${url(size)} 1x, ${url(size * 2)} 2x, ${url(size * 3)} 3x`
    : undefined;

  const url = (targetSize?: number) => {
    const { path, sizes } = $image;

    if (targetSize) {
      const definedSizes = sizes.sort((a, b) => a - b);

      for (const definedSize of definedSizes) {
        if (definedSize > targetSize) {
          return `${PUBLIC_CDN_URL}/${path}/${definedSize}`;
        }
      }
    }

    return `${PUBLIC_CDN_URL}/${path}/full`;
  };
</script>

<div class={clsx('flex center overflow-hidden', _class)}>
  <div
    style:aspect-ratio={$image.width / $image.height}
    class={clsx(
      'relative overflow-hidden',
      !fullyLoaded && 'blur-0',
      $image.width > $image.height === (fit === 'cover') ? 'h-full' : 'w-full'
    )}
  >
    <img
      class="square-full object-cover"
      {src}
      {srcset}
      on:load={() => (loaded = true)}
    />

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
