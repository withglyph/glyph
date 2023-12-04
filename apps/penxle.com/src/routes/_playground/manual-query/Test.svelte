<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';

  $: query = graphql(`
    query PlaygroundManualQueryPage_Query($name: String!) @_manual {
      hello(name: $name)
    }
  `);

  $: console.log($query);

  onMount(() => {
    console.log('onMount');

    let i = 1;
    query.refetch({ name: `${i++}` });
    setInterval(() => {
      query.refetch({ name: `${i++}` });
    }, 1000);
  });
</script>

{$query?.hello}
