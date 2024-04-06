<script lang="ts">
  import qs from 'query-string';
  import CompactLogo from '$assets/logos/compact.svg?component';
  import { fragment, graphql } from '$glitch';
  import { css } from '$styled-system/css';
  import type { Image_image } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  type $$Props = {
    style?: SystemStyleObject;
    size?: number;
    quality?: number;
  } & ({ $image: Image_image } | { $image?: Image_image | null; placeholder: true });

  let _image: Image_image | null = null;
  export { _image as $image };
  export let style: SystemStyleObject | undefined = undefined;
  export let size: number | undefined = undefined;
  export let quality: number | undefined = undefined;
  export let placeholder: true | undefined = true;

  let src: string | null = null;

  $: image = fragment(
    _image,
    graphql(`
      fragment Image_image on Image {
        id
        url
      }
    `),
  );

  $: src =
    $image &&
    qs.stringifyUrl({
      url: $image.url,
      query: { s: size, q: quality },
    });
</script>

{#if src}
  <img class={css(style)} alt="" loading="lazy" {src} />
{:else if placeholder}
  <div
    class={css({ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'gray.50' }, style)}
  >
    <CompactLogo class={css({ color: 'gray.300', width: '1/4' })} />
  </div>
{/if}
