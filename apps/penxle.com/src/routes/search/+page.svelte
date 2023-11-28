<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { DefaultLayout } from '$lib/layouts';

  $: query = graphql(`
    query SearchPage_Query {
      ...DefaultLayout_query
    }
  `);
</script>

<DefaultLayout {$query}>
  search page
  <br />
  query: {$page.url.searchParams.get('q')}
</DefaultLayout>
