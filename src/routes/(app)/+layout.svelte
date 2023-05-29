<script lang="ts">
  import { Link } from '$lib/components';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
</script>

<!-- <Header {$query} /> -->

<main class="grow p-4">
  <div class="mx-auto max-w-screen-lg">
    <div>
      <Link href="/">Home</Link>
      <Link href="/db">Database</Link>
      <Link href="/mutation">Mutation</Link>
      <Link href="/subscription">Subscription</Link>
      <Link href="/test">404</Link>
      <Link href="/toast">Toast</Link>
    </div>
    <slot />
  </div>
</main>

<Footer />
