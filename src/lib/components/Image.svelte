<script lang="ts">
  import clsx from 'clsx';
  import { onMount } from 'svelte';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let src: string;
  export let placeholder: string | undefined = undefined;

  let loaded = false;

  onMount(() => {
    const image = new Image();
    image.addEventListener('load', () => (loaded = true));
    image.src = src;
  });
</script>

{#if loaded}
  <img class={clsx(_class)} {src} />
{:else if placeholder}
  <div class="relative overflow-hidden">
    <img class={clsx('blur-xl scale-110', _class)} src={placeholder} />
  </div>
{/if}
