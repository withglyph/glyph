<script lang="ts">
  import { Helmet, Image, Tooltip } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';

  $: query = useQuery(
    graphql(`
      query ArtworksPage_Query @load {
        images {
          id
          ...Image_image
        }
      }
    `),
  );
</script>

<Helmet title="아트" />

<div class="grid grid-cols-4 gap-4">
  {#each $query.images as image (image.id)}
    <Tooltip message={String(image.id)}>
      <Image
        class="aspect-1 w-full border rounded-3xl object-cover"
        _image={image}
      />
    </Tooltip>
  {/each}
</div>
