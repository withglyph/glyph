<script lang="ts">
  import { graphql } from '$houdini';
  import { Link } from '$lib/components';
  import { unwrap } from '$lib/houdini';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';

  const query = unwrap(
    graphql(`
      query AppLayout_Query @load {
        ...AppLayout_Header_query
      }
    `)
  );
</script>

<Header {$query} />

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
