<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import { PUBLIC_CDN_URL } from '$env/static/public';
  import { fragment, graphql } from '$houdini';
  import { intersectionObserver } from '$lib/svelte/actions';
  import type { Image_image } from '$houdini';

  let _image: Image_image;
  export { _image as $image };
  let _class: string | undefined = undefined;
  export { _class as class };

  let imgEl: HTMLImageElement;
  let visible = writable(false);
  let src: string | undefined = undefined;

  $: image = fragment(
    _image,
    graphql(`
      fragment Image_image on Image {
        path
        sizes
        placeholder
      }
    `)
  );

  $: sizes = [...$image.sizes, Number.POSITIVE_INFINITY].sort((a, b) => a - b);

  $: if ($visible) {
    const s =
      window.devicePixelRatio * Math.max(imgEl.clientWidth, imgEl.clientHeight);

    for (const size of sizes) {
      if (size > s) {
        src = `${PUBLIC_CDN_URL}/${$image.path}/${
          size === Number.POSITIVE_INFINITY ? 'full' : size
        }`;
        break;
      }
    }
  }
</script>

<img
  bind:this={imgEl}
  class={_class}
  alt=""
  src={src ?? $image.placeholder}
  use:intersectionObserver={{
    store: visible,
    once: true,
  }}
/>
