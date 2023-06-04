<script lang="ts">
  import { useQuery } from '$lib/houdini';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: query = useQuery(data.AppLayout_Query);
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
