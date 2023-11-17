<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';

  $: query = graphql(`
    query SpaceCollectionsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
      }
    }
  `);
</script>

<Helmet title={`컬렉션 | ${$query.space.name}`} />

컬렉션
