<script lang="ts">
  import { graphql } from '$glitch';
  import { isWebView } from '$lib/flutter';
  import { flex } from '$styled-system/patterns';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';

  $: query = graphql(`
    query DefaultLayout_Query {
      ...DefaultLayout_Header_query
    }
  `);
</script>

{#if !isWebView()}
  <Header {$query} />
{/if}

<main
  class={flex({
    direction: 'column',
    align: 'center',
    grow: 1,
    marginX: 'auto',
    width: 'full',
    height: 'full',
    backgroundColor: 'gray.0',
  })}
>
  <slot />
</main>

{#if !isWebView()}
  <Footer />
{/if}
