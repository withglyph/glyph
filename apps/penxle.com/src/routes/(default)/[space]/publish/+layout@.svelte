<script lang="ts">
  import { graphql } from '$glitch';

  $: graphql(`
    query SpacePublishLayout_Query($slug: String!) {
      space(slug: $slug) {
        id

        meAsMember {
          id
        }
      }
    }
  `);
</script>

<slot />
