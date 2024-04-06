<script lang="ts">
  import qs from 'query-string';
  import CompactLogo from '$assets/logos/compact.svg?component';
  import { fragment, graphql } from '$bifrost';
  import { css } from '$styled-system/css';
  import type { Image_image } from '$bifrost';
  import type { SystemStyleObject } from '$styled-system/types';

  type Size = 16 | 24 | 32 | 48 | 64 | 96 | 128 | 256 | 512 | 1024 | 'full';

  type $$Props = {
    style?: SystemStyleObject;
    size: Size;
    quality?: number;
  } & ({ $image: Image_image } | { $image?: Image_image | null; placeholder: true });

  let _image: Image_image | null = null;
  export { _image as $image };
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Size;
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

  $: src = $image && qs.stringifyUrl({ url: $image.url, query: { s: size === 'full' ? undefined : size, q: quality } });
  $: src2x = $image && size !== 'full' && qs.stringifyUrl({ url: $image.url, query: { s: size * 2, q: quality } });
  $: src3x = $image && size !== 'full' && qs.stringifyUrl({ url: $image.url, query: { s: size * 3, q: quality } });
</script>

{#if src}
  <img
    class={css(style)}
    alt=""
    loading="lazy"
    sizes={size === 'full' ? undefined : `${size}px`}
    {src}
    srcset={size === 'full' ? undefined : `${src} ${size}w, ${src2x} ${size * 2}w, ${src3x} ${size * 3}w`}
  />
{:else if placeholder}
  <div
    class={css({ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'gray.50' }, style)}
  >
    <CompactLogo class={css({ color: 'gray.300', width: '1/4' })} />
  </div>
{/if}
