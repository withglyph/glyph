<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import { onMount } from 'svelte';
  import { fragment, graphql } from '$houdini';
  import { intersectionObserver } from '$lib/svelte/actions';
  import type { Image_image } from '$houdini';

  export let _image: Image_image;
  let _class: string | undefined = undefined;
  export { _class as class };

  let imgEl: HTMLImageElement;
  let visible = writable(false);
  let src: string;

  $: image = fragment(
    _image,
    graphql(`
      fragment Image_image on Image {
        path
        placeholder
      }
    `)
  );

  onMount(() => {
    // const { clientWidth, clientHeight } = imgEl;
    // const size = window.devicePixelRatio * Math.max(clientWidth, clientHeight);
    // const suffix = $image.sizes.find((v) => v > size) ?? 'full';
    src = `https://pnxl.net/${$image.path}`;
  });
</script>

<img
  bind:this={imgEl}
  class={_class}
  alt=""
  src={$visible ? src : $image.placeholder}
  on:contextmenu|preventDefault
  on:dragstart|preventDefault
  use:intersectionObserver={{
    store: visible,
    once: true,
  }}
/>
