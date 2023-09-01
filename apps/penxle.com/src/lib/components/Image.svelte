<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import { Base64 } from 'js-base64';
  import qs from 'query-string';
  import { thumbHashToDataURL } from 'thumbhash';
  import { fragment, graphql } from '$houdini';
  import { intersectionObserver, resizeObserver } from '$lib/svelte/actions';
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
        placeholder
      }
    `),
  );

  // color 기반으로 placeholder 가져오기 (지금은 안 씀)
  // $: placeholder = `data:image/svg+xml;base64,${btoa(
  //   `<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"><rect fill="${$image.color}" height="1" width="1" /></svg>`,
  // )}`;

  // ThumbHash 기반으로 placeholder 가져오기
  $: placeholder = thumbHashToDataURL(Base64.toUint8Array($image.placeholder));

  const handleResize = (event: CustomEvent<ResizeObserverEntry>) => {
    const { contentRect } = event.detail;

    const max =
      Math.max(contentRect.width, contentRect.height) * window.devicePixelRatio;
    const size = Math.pow(2, Math.ceil(Math.log2(max)));

    src = qs.stringifyUrl({
      url: `https://pnxl.net/${$image.path}`,
      query: { s: size },
    });
  };
</script>

<img
  class={_class}
  alt=""
  src={$visible ? src : placeholder}
  on:resizeObserved={handleResize}
  on:contextmenu|preventDefault
  on:dragstart|preventDefault
  use:intersectionObserver={{
    store: visible,
    once: true,
  }}
  use:resizeObserver
/>
