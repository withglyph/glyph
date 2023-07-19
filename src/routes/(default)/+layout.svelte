<script lang="ts">
  import { graphql, useQuery } from '$lib/houdini';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';

  $: query = useQuery(
    graphql(`
      query DefaultLayout_Query @load {
        ...DefaultLayout_Header_query
      }
    `),
  );
</script>

{#if $query}
  <Header _query={$query} />

  <main class="grow p-4">
    <div class="mx-auto max-w-screen-lg">
      <slot />
    </div>
  </main>

  <Footer />
{/if}
