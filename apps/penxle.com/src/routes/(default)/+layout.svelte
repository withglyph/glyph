<script lang="ts">
  import { graphql } from '$glitch';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';

  $: query = graphql(`
    query DefaultLayout_Query {
      ...DefaultLayout_Header_query
    }
  `);
</script>

<Header {$query} />

<main class="flex grow items-start justify-center m-auto w-full bg-gray-5">
  <slot />
</main>

<Footer />
