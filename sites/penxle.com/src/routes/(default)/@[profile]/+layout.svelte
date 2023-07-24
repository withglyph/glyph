<script lang="ts">
  import { graphql, useQuery } from '$lib/houdini';

  $: useQuery(
    graphql(`
      query ProfileLayout_Query($handle: String!) @load {
        profile(handle: $handle) {
          __typename
        }
      }
    `),
  );
</script>

<slot />
