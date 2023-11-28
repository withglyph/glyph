<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { DefaultLayout_query } from '$glitch';

  let _query: DefaultLayout_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment DefaultLayout_query on Query {
        ...DefaultLayout_Header_query
      }
    `),
  );
</script>

<Header {$query} />

<main class="flex flex-col grow items-center justify-start mx-auto w-full h-full bg-primary">
  <slot />
</main>

<Footer />
