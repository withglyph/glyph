<script lang="ts">
  import { graphql } from '$glitch';
  import { MeLayout } from '$lib/layouts';

  $: query = graphql(`
    query MeDashboardPage_Query {
      ...MeLayout_query
    }
  `);
</script>

<MeLayout {$query} />
