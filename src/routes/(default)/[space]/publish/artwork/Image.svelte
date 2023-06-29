<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Artwork } from './types';

  export let artwork: Artwork;
  let _class: string | undefined = undefined;
  export { _class as class };

  const src = URL.createObjectURL(artwork.file);

  onDestroy(() => {
    URL.revokeObjectURL(src);
  });
</script>

<img
  class={_class}
  alt=""
  {src}
  on:contextmenu|preventDefault
  on:dragstart|preventDefault
/>
