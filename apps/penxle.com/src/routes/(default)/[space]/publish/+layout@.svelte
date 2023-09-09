<script lang="ts">
  import { graphql } from '$glitch';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: query = graphql(`
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
