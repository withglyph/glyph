<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import { onMount } from 'svelte';
  import { fragment, graphql } from '$houdini';
  import { intersectionObserver } from '$lib/svelte/actions';
  import type { Image_image } from '$houdini';

  export let _image: Image_image;
  let _class: string | undefined = undefined;
  export { _class as class };

  const visible = writable(false);
  let src: string;

  $: image = fragment(
    _image,
    graphql(`
      fragment Image_image on Image {
        path
        color
      }
    `),
  );

  $: placeholder = `data:image/svg+xml;base64,${btoa(
    `<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"><rect fill="${$image.color}" height="1" width="1" /></svg>`,
  )}`;

  onMount(() => {
    // const { clientWidth, clientHeight } = imgEl;
    // const size = window.devicePixelRatio * Math.max(clientWidth, clientHeight);
    // const suffix = $image.sizes.find((v) => v > size) ?? 'full';
    src = `https://pnxl.net/${$image.path}`;
  });
</script>

<img
  class={_class}
  alt=""
  src={$visible ? src : placeholder}
  on:contextmenu|preventDefault
  on:dragstart|preventDefault
  use:intersectionObserver={{
    store: visible,
    once: true,
  }}
/>
