<script lang="ts">
  import { Image } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import FileImage from './FileImage.svelte';
  import type { Image_image } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  type IsomorphicImage = { id: string } & (
    | { kind: 'file'; __file: File }
    | { kind: 'data'; __data: { id: string; name: string } & Image_image }
  );

  export let style: SystemStyleObject | undefined = undefined;
  export let image: IsomorphicImage;
</script>

{#if image.kind === 'file'}
  <div class={css({ position: 'relative' }, style)}>
    <FileImage style={css.raw(style)} file={image.__file} />
    <div class={center({ position: 'absolute', inset: '0', backgroundColor: 'gray.5/50' })}>
      <RingSpinner style={css.raw({ color: 'brand.400', size: '32px' })} />
    </div>
  </div>
{:else if image.kind === 'data'}
  <Image style={css.raw(style)} $image={image.__data} size="full" />
{/if}
