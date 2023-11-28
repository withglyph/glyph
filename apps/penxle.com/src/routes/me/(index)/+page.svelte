<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { MeLayout } from '$lib/layouts';

  $: query = graphql(`
    query MeIndexPage_Query {
      ...MeLayout_query
    }
  `);

  onMount(() => {
    if (window.innerWidth >= 800) {
      goto('/me/cabinets');
    }
  });
</script>

<MeLayout {$query} />
