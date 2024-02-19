<script lang="ts">
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';
  import Header from './Header.svelte';

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
  <Image class="fixed inset-0 square-full object-cover" $image={$query.authLayoutBackgroundImage} />
{/if}

<Header />

<main class="flex m-auto px-4 w-full center sm:px-0">
  <div class="z-1 flex flex-col center rounded-2xl w-full max-w-107.5 bg-white py-7 px-5 sm:px-10">
    <slot />
  </div>
</main>
