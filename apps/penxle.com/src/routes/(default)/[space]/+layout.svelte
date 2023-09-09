<script lang="ts">
  import { graphql } from '$glitch';

  $: graphql(`
    query SpaceLayout_Query($slug: String!) {
      space(slug: $slug) {
        id
      }
    }
  `);
</script>

<slot />
