<script lang="ts">
  import { graphql } from '$houdini';
  import { useQuery } from '$lib/houdini';

  $: useQuery(
    graphql(`
      query SpaceDashboardLayout_Query($slug: String!) @load {
        space(slug: $slug) {
          meAsMember {
            __typename
          }
        }
      }
    `),
  );
</script>

<slot />
