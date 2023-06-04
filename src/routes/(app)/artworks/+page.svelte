<script lang="ts">
  import { Helmet, Image, Tooltip } from '$lib/components';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ ArtworksPage_Query } = data);
</script>

<Helmet title="아트" />

<div class="grid grid-cols-4 gap-4">
  {#if $ArtworksPage_Query.data}
    {#each $ArtworksPage_Query.data.images as image (image.id)}
      <Tooltip message={image.id}>
        <Image
          class="aspect-1 w-full border rounded-3xl object-cover"
          $image={image}
        />
      </Tooltip>
    {/each}
  {:else}
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array.from({ length: 20 }) as _, index (index)}
      <div class="aspect-1 w-full border rounded-3xl bg-gray-200" />
    {/each}
  {/if}
</div>
