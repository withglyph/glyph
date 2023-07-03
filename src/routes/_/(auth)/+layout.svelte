<script lang="ts">
  import { Image } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';

  $: query = useQuery(
    graphql(`
      query AuthLayout_Query @load {
        featuredImage {
          ...Image_image
        }
      }
    `)
  );
</script>

<main class="flex grow center">
  {#if $query.featuredImage}
    <Image
      class="pointer-events-none absolute inset-0 square-full object-cover"
      _image={$query.featuredImage}
    />
  {/if}

  <div class="z-1 rounded-xl bg-white p-12 shadow-2xl">
    <slot />
  </div>
</main>
