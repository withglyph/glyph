<script lang="ts">
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;

  $: ({ AppLayout_Query: query } = data);
</script>

<Header $query={$query.data} />

<main class="grow p-4">
  <div class="mx-auto max-w-screen-lg">
    <slot />
  </div>
</main>

<Footer />
