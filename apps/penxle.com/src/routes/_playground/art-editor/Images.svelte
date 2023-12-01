<script lang="ts">
  import Image from './Image.svelte';
  import Importer from './Importer.svelte';
  import Thumbnail from './Thumbnail.svelte';
  import type { Artwork } from './types';

  export let artworks: Artwork[];
</script>

<div class="h-100 flex center gap-4 overflow-x-auto bg-gray-10">
  {#each artworks as artwork (artwork.id)}
    <div class="relative square-80 flex-none rounded bg-white">
      <Image class="square-full rounded object-contain" {artwork} />
      <button
        class="absolute right-2 top-2 square-8 flex center rounded-full bg-black/50"
        type="button"
        on:click={() => (artworks = artworks.filter((v) => v.id !== artwork.id))}
      >
        <i class="i-lc-x square-6 text-white" />
      </button>
      <Thumbnail bind:artwork />
    </div>
  {/each}

  <div class="square-80 flex-none border-4 rounded border-dashed">
    <label class="square-full flex cursor-pointer center bg-white text-sm transition hover:bg-gray-5" for="file">
      <i class="i-lc-plus-circle square-8 text-gray-30" />
    </label>
  </div>
</div>

<Importer bind:artworks />
