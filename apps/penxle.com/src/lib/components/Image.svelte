<script lang="ts">
  import clsx from 'clsx';
  import { Base64 } from 'js-base64';
  import qs from 'query-string';
  import { tick } from 'svelte';
  import { sineOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';
  import { thumbHashToDataURL } from 'thumbhash';
  import { fragment, graphql } from '$glitch';
  import { intersectionObserver, resizeObserver } from '$lib/svelte/actions';
  import type { Image_image } from '$glitch';

  let _image: Image_image;
  let _class: string | undefined = undefined;
  export { _image as $image, _class as class };
  export let quality: number | undefined = undefined;
  export let fit: 'cover' | 'contain' = 'cover';
  export let fade = true;

  let imgEl: HTMLImageElement | undefined;
  let domRect: DOMRect | undefined;

  let visible = false;
  let loaded = false;

  let src: string;

  $: image = fragment(
    _image,
    graphql(`
      fragment Image_image on Image {
        id
        placeholder
        url
      }
    `),
  );

  $: placeholder = thumbHashToDataURL(Base64.toUint8Array($image.placeholder));

  $: if ($image && imgEl && domRect) {
    load();
  }

  const load = async () => {
    if (!$image || !imgEl || !domRect) {
      return;
    }

    const max =
      Math.max(domRect.width, domRect.height) * window.devicePixelRatio;
    const size = Math.pow(2, Math.ceil(Math.log2(max)));

    src = qs.stringifyUrl({
      url: $image.url,
      query: { s: size, q: quality },
    });

    await tick();
    loaded = imgEl.complete;
  };
</script>

<div
  class={clsx('overflow-hidden', _class)}
  role="img"
  on:contextmenu|preventDefault
  on:dragstart|preventDefault
  use:intersectionObserver={{ once: true, handler: (v) => (visible = v) }}
  use:resizeObserver={({ contentRect }) => (domRect = contentRect)}
>
  <div class="square-full relative">
    {#if visible}
      <img
        bind:this={imgEl}
        style:object-fit={fit}
        class="square-full"
        alt=""
        {src}
        on:load={() => (loaded = true)}
      />
    {/if}

    {#if !loaded}
      <img
        style:object-fit={fit}
        class="absolute top-0 left-0 square-full"
        alt=""
        src={placeholder}
        transition:scale={{
          duration: fade ? 150 : 0,
          start: 1.5,
          easing: sineOut,
        }}
      />
    {/if}
  </div>
</div>
