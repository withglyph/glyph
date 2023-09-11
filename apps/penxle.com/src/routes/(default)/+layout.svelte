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

<main class="grow p-4">
  <div class="mx-auto max-w-screen-lg">
    <slot />
  </div>
</main>

<Footer />
