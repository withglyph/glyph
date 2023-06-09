<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { Image } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';

  const query = useQuery(
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
      $image={$query.featuredImage}
    />
  {/if}

  <a class="absolute left-4 top-4 z-1" href="/">
    <Wordmark class="h-6 text-white" />
  </a>

  <div class="z-1 rounded-xl bg-white p-12 shadow-2xl">
    <slot />
  </div>
</main>
