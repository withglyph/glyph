<script lang="ts">
  import clsx from 'clsx';
  import { Image } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import FileImage from './FileImage.svelte';
  import type { Image_image } from '$glitch';

  type IsomorphicImage = { id: string } & (
    | { kind: 'file'; __file: File }
    | { kind: 'data'; __data: { id: string; name: string } & Image_image }
  );

  let _class: string | undefined = undefined;
  export { _class as class };
  export let image: IsomorphicImage;
</script>

{#if image.kind === 'file'}
  <div class={clsx('relative', _class)}>
    <FileImage class={_class} file={image.__file} />
    <div class="absolute inset-0 flex center bg-white/50">
      <RingSpinner class="w-8 h-8 text-teal-500" />
    </div>
  </div>
{:else if image.kind === 'data'}
  <Image class={_class} $image={image.__data} />
{/if}
