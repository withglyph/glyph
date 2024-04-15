<script lang="ts">
  import { graphql } from '$glitch';
  import { flex } from '$styled-system/patterns';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';

  $: query = graphql(`
    query DefaultLayout_Query {
      ...DefaultLayout_Header_query
    }
  `);
</script>

<Header {$query} />

<main
  class={flex({
    direction: 'column',
    align: 'center',
    grow: 1,
    marginX: 'auto',
    width: 'full',
    height: 'full',
    backgroundColor: 'gray.50',
  })}
>
  <slot />
</main>

<Footer />
