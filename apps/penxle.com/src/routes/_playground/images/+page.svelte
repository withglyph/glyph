<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button, Image } from '$lib/components';

  $: query = graphql(`
    query ImagesPage_Query {
      sampleImages {
        id
        ...Image_image
      }
    }
  `);
</script>

<Helmet title="이미지 목록 플레이그라운드" />

<div class="flex grow center">
  <div class="flex flex-col center gap-4 w-full p-4">
    <div class="grid grid-cols-4 gap-4 w-full">
      {#each $query.sampleImages as image (image.id)}
        <Image class="w-full aspect-1/1 rounded-xl" $image={image} />
      {/each}
    </div>
  </div>
</div>

<div class="fixed top-8 right-8">
  <Button color="primary" size="md" on:click={() => query.refetch()}>refetch</Button>
</div>
