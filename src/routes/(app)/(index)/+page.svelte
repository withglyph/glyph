<script lang="ts">
  import { graphql } from '$houdini';
  import { Helmet, Tooltip } from '$lib/components';
  import { unwrap } from '$lib/houdini';

  const query = unwrap(
    graphql(`
      query IndexPage_Query @load {
        greeting
      }
    `)
  );
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{ src: 'https://pnxl.net/static/og.png', size: 'large' }}
  title="펜슬 - 창작을 즐겁게"
/>

<code>{$query.greeting}</code>

<Tooltip message="OG Image" placement="top">
  <img src="https://pnxl.net/static/og.png" />
</Tooltip>
