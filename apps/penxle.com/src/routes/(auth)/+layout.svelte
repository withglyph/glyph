<script lang="ts">
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';

  $: query = graphql(`
    query AuthLayout_Query {
      authLayoutBackgroundImage {
        id
        ...Image_image
      }
    }
  `);
</script>

<main class="flex grow center">
  {#if $query.authLayoutBackgroundImage}
    <Image
      class="pointer-events-none absolute inset-0 square-full object-cover"
      _image={$query.authLayoutBackgroundImage}
    />
  {/if}

  <div class="z-1 rounded-xl bg-white p-12 shadow-2xl">
    <slot />
  </div>
</main>
