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

{#if $query.authLayoutBackgroundImage}
  <Image class="fixed inset-0" _image={$query.authLayoutBackgroundImage} />
{/if}

<main class="fixed inset-0 flex center">
  <div class="rounded-xl bg-white p-12 shadow-2xl">
    <slot />
  </div>
</main>
