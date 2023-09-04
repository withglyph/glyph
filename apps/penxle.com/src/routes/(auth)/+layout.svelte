<script lang="ts">
  import { Image } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';

  $: query = useQuery(
    graphql(`
      query AuthLayout_Query @load {
        authLayoutBackgroundImage {
          ...Image_image
        }
      }
    `),
  );
</script>

<main class="flex m-auto px-4 w-full center sm:px-0">
  {#if $query.authLayoutBackgroundImage}
    <Image
      class="pointer-events-none absolute inset-0 square-full object-cover"
      _image={$query.authLayoutBackgroundImage}
    />
  {/if}

  <div
    class="z-1 flex flex-col center rounded-2xl w-full max-w-107.5 bg-white py-7 px-5 sm:px-10"
  >
    <slot />
  </div>
</main>
