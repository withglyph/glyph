<script lang="ts">
  import qs from 'query-string';
  import { fragment, graphql } from '$glitch';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { Image_image } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let _image: Image_image | undefined = undefined;
  export { _image as $image };
  export let style: SystemStyleObject | undefined = undefined;
  export let size: number | undefined = undefined;
  export let quality: number | undefined = undefined;

  $: image =
    _image &&
    fragment(
      _image,
      graphql(`
        fragment Image_image on Image {
          id
          url
        }
      `),
    );

  $: src =
    image &&
    $image &&
    qs.stringifyUrl({
      url: $image.url,
      query: { s: size, q: quality },
    });
</script>

{#if src}
  <img class={css(style)} alt="" loading="lazy" {src} />
{:else}
  <div class={center({ color: 'gray.300', backgroundColor: 'gray.50', ...style })}>
    <svg fill="currentColor" viewBox="0 0 69 58" width="41%" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.087 0H0v58h23.087V0ZM69 0H28.253v58h40.749V0Z" />
    </svg>
  </div>
{/if}
