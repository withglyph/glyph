<script lang="ts">
  import { graphql } from '$glitch';

  $: graphql(`
    query SpaceDashboardLayout_Query($slug: String!) {
      space(slug: $slug) {
        meAsMember {
          __typename
        }
      }
    }
  `);
</script>

<slot />
