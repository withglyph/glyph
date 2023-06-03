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

  let visible = writable(false);
  let loaded = false;

  let src: string | undefined = undefined;
  let clientWidth: number | undefined = undefined;
  let clientHeight: number | undefined = undefined;

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

  $: if (clientWidth && clientHeight) {
    const s = window.devicePixelRatio * Math.max(clientWidth, clientHeight);

    for (const size of sizes) {
      if (size > s) {
        src = `${PUBLIC_CDN_URL}/${$image.path}/${
          size === Number.POSITIVE_INFINITY ? 'full' : size
        }`;
        break;
      }
    }
  }

  $: if (src && $visible) {
    const img = new Image();
    img.addEventListener('load', () => (loaded = true));
    img.src = src;
  }
</script>

{#if loaded}
  <img class={_class} alt="" {src} />
{:else}
  <div
    bind:clientWidth
    bind:clientHeight
    use:intersectionObserver={{
      store: visible,
      once: true,
    }}
  >
    <img class={_class} alt="" src={$image.placeholder} />
  </div>
{/if}
