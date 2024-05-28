<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';

  $: query = graphql(`
    query SpaceDashboardIndexPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
      }
    }
  `);
</script>

<Helmet description={`${$query.space.name} 스페이스 대시보드`} title={`대시보드 | ${$query.space.name}`} />

dashboard
