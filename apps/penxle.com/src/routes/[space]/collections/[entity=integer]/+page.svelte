<script lang="ts">
  import { graphql } from '$glitch';
  import { SpaceLayout } from '$lib/layouts';

  $: query = graphql(`
    query SpaceCollectionsEntityPage_Query($slug: String!) {
      ...SpaceLayout_query
    }
  `);
</script>

<SpaceLayout {$query}>컬렉션 세부 페이지</SpaceLayout>
