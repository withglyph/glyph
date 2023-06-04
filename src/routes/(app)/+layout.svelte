<script lang="ts">
  import { graphql, useQuery } from '$lib/houdini';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';

  const query = useQuery(
    graphql(`
      query AppLayout_Query @load {
        ...AppLayout_Header_query
      }
    `)
  );
</script>

{#if $query}
  <Header {$query} />

  <main class="grow p-4">
    <div class="mx-auto max-w-screen-lg">
      <slot />
    </div>
  </main>

  <Footer />
{/if}
