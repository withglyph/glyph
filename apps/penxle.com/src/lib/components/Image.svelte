<script lang="ts">
  import qs from 'query-string';
  import { fragment, graphql } from '$glitch';
  import { css } from '$styled-system/css';
  import type { Image_image } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let _image: Image_image;
  export { _image as $image };
  export let style: SystemStyleObject | undefined = undefined;
  export let size: number | undefined = undefined;
  export let quality: number | undefined = undefined;

  let src: string;

  $: image = fragment(
    _image,
    graphql(`
      fragment Image_image on Image {
        id
        url
      }
    `),
  );

  $: src = qs.stringifyUrl({
    url: $image.url,
    query: { s: size, q: quality },
  });
</script>

<img class={css(style)} alt="" loading="lazy" {src} />
