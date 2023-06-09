<script lang="ts">
  import { Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';

  const query = useQuery(
    graphql(`
      query SpacePage_Query($slug: String!) @load {
        space(slug: $slug) {
          name
        }
      }
    `)
  );
</script>

<Helmet title={$query.space.name} />

{$query.space.name}
