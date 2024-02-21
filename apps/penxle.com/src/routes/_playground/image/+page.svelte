<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Image } from '$lib/components';

  $: query = graphql(`
    query ImagePage_Query {
      sampleImage {
        id
        ...Image_image
      }
    }
  `);
</script>

<div class="flex flex-col gap-4 grow center">
  <Image class="w-1/4 aspect-1/1 rounded-xl" $image={$query.sampleImage} />

  <Button color="primary" size="md" on:click={() => query.refetch()}>refetch</Button>
</div>
