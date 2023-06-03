<script lang="ts">
  import { Link } from '$lib/components';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;

  $: ({ AppLayout_Query } = data);
</script>

<Header $query={$AppLayout_Query.data} />

<main class="grow p-4">
  <div class="mx-auto max-w-screen-lg">
    <div>
      <Link href="/">Home</Link>
      <Link href="/db">Database</Link>
      <Link href="/upload">Upload</Link>
      <Link href="/test">404</Link>
      <Link href="/toast">Toast</Link>
    </div>
    <slot />
  </div>
</main>

<Footer />
