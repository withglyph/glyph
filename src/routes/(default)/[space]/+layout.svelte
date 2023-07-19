<script lang="ts">
  import { graphql } from '$houdini';
  import { useQuery } from '$lib/houdini';

  $: useQuery(
    graphql(`
      query SpaceLayout_Query($slug: String!) @load {
        space(slug: $slug) {
          __typename
        }
      }
    `),
  );
</script>

<slot />
