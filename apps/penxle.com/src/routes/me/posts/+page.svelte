<script lang="ts">
  import { graphql } from '$glitch';
  import { MeLayout } from '$lib/layouts';

  $: query = graphql(`
    query MePostsPage_Query {
      ...MeLayout_query
    }
  `);
</script>

<MeLayout {$query} />
포스트 관리
