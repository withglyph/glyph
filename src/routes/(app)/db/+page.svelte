<script lang="ts">
  import { graphql } from '$houdini';
  import { Helmet } from '$lib/components';
  import { unwrap } from '$lib/houdini';

  const query = unwrap(
    graphql(`
      query DbPage_Query @load {
        db
      }
    `)
  );
</script>

<Helmet title="Database" />

<code>{$query.db}</code>
