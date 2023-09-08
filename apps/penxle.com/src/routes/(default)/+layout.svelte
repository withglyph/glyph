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

{#if $query}
  <Header _query={$query} />
  <main class="flex grow center m-auto px-4 w-full sm:px-0 bg-gray-5">
    <div class="mx-auto max-w-screen-lg py-7 px-5 sm:px-10">
      <slot />
    </div>
  </main>

  <Footer />
{/if}
