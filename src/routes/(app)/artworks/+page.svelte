<script lang="ts">
  import { graphql } from '$houdini';
  import { Helmet, Image } from '$lib/components';
  import { unwrap } from '$lib/houdini';

  const query = unwrap(
    graphql(`
      query ArtworksPage_Query @load {
        images {
          id
          ...Image_image
        }
      }
    `)
  );
</script>

<Helmet title="아트" />

<div class="grid grid-cols-4 gap-4">
  {#each $query.images as image (image.id)}
    <Image class="aspect-1 w-full rounded-3xl object-cover" $image={image} />
  {/each}
</div>
