<script lang="ts">
  import qs from 'query-string';
  import { fragment, graphql } from '$glitch';
  import type { Image_image } from '$glitch';

  let _image: Image_image;
  let _class: string | undefined = undefined;
  export { _image as $image, _class as class };
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

<img class={_class} alt="" loading="lazy" {src} />
