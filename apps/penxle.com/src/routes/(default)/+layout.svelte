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

<main class="flex flex-col grow items-center justify-start mx-auto w-full h-full bg-primary">
  <slot />
</main>

<Footer />
